import * as anchor from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createInitializeMintInstruction, ExtensionType, getMintLen, TOKEN_2022_PROGRAM_ID, createInitializeTransferFeeConfigInstruction, createInitializeTransferHookInstruction } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log("Creating Token-2022 Mints with Transfer Hooks and Transfer Fees...");

    const akariIdlPath = './target/idl/akari.json';
    const hookIdlPath = './target/idl/transfer_hook.json';
    
    const configPath = path.join(process.env.HOME || '', '.config', 'solana', 'id.json');
    const secretKeyStr = fs.readFileSync(configPath, 'utf8');
    const secretKey = Uint8Array.from(JSON.parse(secretKeyStr));
    const authority = Keypair.fromSecretKey(secretKey);

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const wallet = new anchor.Wallet(authority);
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    anchor.setProvider(provider);

    const hookIdl = JSON.parse(fs.readFileSync(hookIdlPath, 'utf8'));
    const hookProgram = new anchor.Program(hookIdl, provider);

    const akariIdl = JSON.parse(fs.readFileSync(akariIdlPath, 'utf8'));
    const akariProgram = new anchor.Program(akariIdl, provider);

    const createMint = async (sym: string, decimals: number) => {
        const mintKeypair = Keypair.generate();
        const mint = mintKeypair.publicKey;
        
        const extensions = [ExtensionType.TransferFeeConfig, ExtensionType.TransferHook];
        const mintLen = getMintLen(extensions);
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

        const tx = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: authority.publicKey,
                newAccountPubkey: mint,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeTransferFeeConfigInstruction(
                mint,
                authority.publicKey,
                authority.publicKey,
                50, // 0.5% (50 bps)
                BigInt(5 * 10**decimals), // max fee
                TOKEN_2022_PROGRAM_ID
            ),
            createInitializeTransferHookInstruction(
                mint,
                authority.publicKey, // authority
                hookProgram.programId, // hook program ID
                TOKEN_2022_PROGRAM_ID
            ),
            createInitializeMintInstruction(
                mint,
                decimals,
                authority.publicKey,
                null,
                TOKEN_2022_PROGRAM_ID
            )
        );

        const sig = await sendAndConfirmTransaction(connection, tx, [authority, mintKeypair], { commitment: 'confirmed' });
        console.log(`Created ${sym} Mint: ${mint.toBase58()} (tx: ${sig})`);
        
        console.log(`Initializing ExtraAccountMetaList for ${sym}...`);
        
        const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("extra-account-metas"), mint.toBuffer()],
            hookProgram.programId
        );

        const [kycRootPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("kyc_root")],
            hookProgram.programId
        );

        await hookProgram.methods.initializeExtraAccountMetaList()
        .accounts({
            payer: authority.publicKey,
            extraAccountMetaList: extraAccountMetaListPDA,
            mint: mint,
            kycMerkleRoot: kycRootPda,
            systemProgram: SystemProgram.programId,
        })
        .rpc();
        console.log(`  => ExtraAccountMetaList created for ${sym}`);
        
        return mint.toBase58();
    };

    const usdc = await createMint("USDC", 6);
    const eurc = await createMint("EURC", 6);
    const chfc = await createMint("CHFC", 6);

    const addresses = {
        USDC_MINT: usdc,
        EURC_MINT: eurc,
        CHFC_MINT: chfc,
        TRANSFER_HOOK: hookProgram.programId.toBase58(),
        AKARI: akariProgram.programId.toBase58(),
    };

    fs.writeFileSync('./devnet-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("Saved to devnet-addresses.json!");
}

main().catch(console.error);
