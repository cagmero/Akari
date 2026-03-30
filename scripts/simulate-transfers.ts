import * as anchor from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { 
    getOrCreateAssociatedTokenAccount, 
    mintTo, 
    TOKEN_2022_PROGRAM_ID,
    getAssociatedTokenAddressSync
} from '@solana/spl-token';
import fs from 'fs';
import path from 'path';

const IDL_PATH = path.resolve(__dirname, '../app/src/idl/akari.json');
const ADDRESSES_PATH = path.resolve(__dirname, '../devnet-addresses.json');

async function main() {
    console.log("🚀 Starting Akari Demo Simulation...");

    const configPath = path.join(process.env.HOME || '', '.config', 'solana', 'id.json');
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(configPath, 'utf8')));
    const authority = Keypair.fromSecretKey(secretKey);

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const wallet = new anchor.Wallet(authority);
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    anchor.setProvider(provider);

    const idl = JSON.parse(fs.readFileSync(IDL_PATH, 'utf8'));
    const program = new anchor.Program(idl, provider);

    const addresses = JSON.parse(fs.readFileSync(ADDRESSES_PATH, 'utf8'));
    const USDC_MINT = new PublicKey(addresses.USDC_MINT);
    const EURC_MINT = new PublicKey(addresses.EURC_MINT);
    const HOOK_PROGRAM_ID = new PublicKey(addresses.TRANSFER_HOOK);

    const subs = [
        { name: "Corp Germany GmbH", id: "CORP-DE-001", keypair: Keypair.generate() },
        { name: "Corp Singapore Pte", id: "CORP-SG-001", keypair: Keypair.generate() },
        { name: "Corp USA LLC", id: "CORP-US-001", keypair: Keypair.generate() }
    ];

    const [poolVaultPda] = PublicKey.findProgramAddressSync([Buffer.from('pool_vault')], program.programId);

    // Common PDA for all mints (KycMerkleRoot)
    const [kycRootPda] = PublicKey.findProgramAddressSync([Buffer.from("kyc_root")], HOOK_PROGRAM_ID);

    for (const sub of subs) {
        console.log(`\n📦 Preparing ${sub.name}...`);
        
        // Gas transfer
        const transferIx = anchor.web3.SystemProgram.transfer({
            fromPubkey: authority.publicKey,
            toPubkey: sub.keypair.publicKey,
            lamports: 0.1 * anchor.web3.LAMPORTS_PER_SOL,
        });
        const transferTx = new anchor.web3.Transaction().add(transferIx);
        await anchor.web3.sendAndConfirmTransaction(connection, transferTx, [authority]);

        const [subPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('subsidiary'), sub.keypair.publicKey.toBuffer()],
            program.programId
        );

        console.log(`  - Registering...`);
        const vaspIdArr = Array.from(Buffer.from(sub.id.padEnd(16, '\0')));
        await program.methods.registerSubsidiary(
            Array.from(new Uint8Array(32)), 
            Array.from(new Uint8Array(32)), 
            vaspIdArr
        ).accounts({
            subsidiaryAccount: subPda,
            poolVault: poolVaultPda,
            owner: sub.keypair.publicKey,
            authority: authority.publicKey,
            systemProgram: SystemProgram.programId,
        }).rpc();

        console.log(`  - Funding tokens...`);
        for (const mint of [USDC_MINT, EURC_MINT]) {
            const ata = await getOrCreateAssociatedTokenAccount(
                connection, authority, mint, sub.keypair.publicKey, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID
            );
            await mintTo(
                connection, authority, mint, ata.address, authority, 1_000_000 * 1_000_000, [], { commitment: 'confirmed' }, TOKEN_2022_PROGRAM_ID
            );
        }
    }

    const germany = subs[0];
    const singapore = subs[1];
    const [germanyPda] = PublicKey.findProgramAddressSync([Buffer.from('subsidiary'), germany.keypair.publicKey.toBuffer()], program.programId);
    const [singaporePda] = PublicKey.findProgramAddressSync([Buffer.from('subsidiary'), singapore.keypair.publicKey.toBuffer()], program.programId);

    // RE-ORDERED ACCOUNTS: [ExtraAccountMetaList, Referenced Account, Hook Program ID]
    const [extraMetaUsdc] = PublicKey.findProgramAddressSync([Buffer.from("extra-account-metas"), USDC_MINT.toBuffer()], HOOK_PROGRAM_ID);
    const [extraMetaEurc] = PublicKey.findProgramAddressSync([Buffer.from("extra-account-metas"), EURC_MINT.toBuffer()], HOOK_PROGRAM_ID);

    console.log("\n💸 Action: Corp Germany deposits 50,000 USDC...");
    const germanyUsdcAta = getAssociatedTokenAddressSync(USDC_MINT, germany.keypair.publicKey, false, TOKEN_2022_PROGRAM_ID);
    const poolUsdcAta = await getOrCreateAssociatedTokenAccount(connection, authority, USDC_MINT, poolVaultPda, true, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);
    
    await program.methods.deposit(new anchor.BN(50_000 * 1_000_000), 0)
        .accounts({
            subsidiaryAccount: germanyPda,
            poolVault: poolVaultPda,
            subsidiaryAta: germanyUsdcAta,
            poolAta: poolUsdcAta.address,
            mint: USDC_MINT,
            owner: germany.keypair.publicKey,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .remainingAccounts([
            { pubkey: extraMetaUsdc, isWritable: false, isSigner: false },
            { pubkey: kycRootPda, isWritable: false, isSigner: false },
            { pubkey: HOOK_PROGRAM_ID, isWritable: false, isSigner: false },
        ])
        .signers([germany.keypair])
        .rpc();

    console.log("💸 Action: Corp Singapore deposits 30,000 EURC...");
    const singaporeEurcAta = getAssociatedTokenAddressSync(EURC_MINT, singapore.keypair.publicKey, false, TOKEN_2022_PROGRAM_ID);
    const poolEurcAta = await getOrCreateAssociatedTokenAccount(connection, authority, EURC_MINT, poolVaultPda, true, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID);

    await program.methods.deposit(new anchor.BN(30_000 * 1_000_000), 1)
        .accounts({
            subsidiaryAccount: singaporePda,
            poolVault: poolVaultPda,
            subsidiaryAta: singaporeEurcAta,
            poolAta: poolEurcAta.address,
            mint: EURC_MINT,
            owner: singapore.keypair.publicKey,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .remainingAccounts([
            { pubkey: extraMetaEurc, isWritable: false, isSigner: false },
            { pubkey: kycRootPda, isWritable: false, isSigner: false },
            { pubkey: HOOK_PROGRAM_ID, isWritable: false, isSigner: false },
        ])
        .signers([singapore.keypair])
        .rpc();

    console.log("💱 Action: Corp Germany swaps 10,000 USDC → EURC (Notional)...");
    const pairBuf = Buffer.from('EUR_USDP');
    const [epochPda] = PublicKey.findProgramAddressSync([Buffer.from('epoch_state'), pairBuf], program.programId);
    const [sixPda] = PublicKey.findProgramAddressSync([Buffer.from('six_price_feed'), pairBuf], program.programId);

    await program.methods.fxSwap(0, 1, new anchor.BN(10_000 * 1_000_000), Array.from(pairBuf), Buffer.from([]))
        .accounts({
            owner: germany.keypair.publicKey,
            subsidiaryAccount: germanyPda,
            poolVault: poolVaultPda,
            epochState: epochPda,
            sixPriceFeed: sixPda,
        })
        .signers([germany.keypair])
        .rpc();

    console.log("🏦 Action: Corp Germany withdraws 15,000 USDC (Travel Rule)...");
    await program.methods.withdraw(new anchor.BN(15_000 * 1_000_000), 0)
        .accounts({
            subsidiaryAccount: germanyPda,
            poolVault: poolVaultPda,
            subsidiaryAta: germanyUsdcAta,
            poolAta: poolUsdcAta.address,
            mint: USDC_MINT,
            owner: germany.keypair.publicKey,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .remainingAccounts([
            { pubkey: extraMetaUsdc, isWritable: false, isSigner: false },
            { pubkey: kycRootPda, isWritable: false, isSigner: false },
            { pubkey: HOOK_PROGRAM_ID, isWritable: false, isSigner: false },
        ])
        .signers([germany.keypair])
        .rpc();

    console.log("\n✅ Simulation Complete!");
}

main().catch(err => {
    console.error("❌ Simulation Failed:", err);
    process.exit(1);
});
