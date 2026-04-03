import * as anchor from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { createInitializeMintInstruction, ExtensionType, getMintLen, TOKEN_2022_PROGRAM_ID, createInitializeTransferFeeConfigInstruction, createInitializePermanentDelegateInstruction, createInitializeTransferHookInstruction, createMintToInstruction } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log("Setting up Akari Devnet Environment...");

    const idlPath = './target/idl/akari.json';
    const hookIdlPath = './target/idl/transfer_hook.json';
    
    // Check keypair
    const configPath = path.join(process.env.HOME || '', '.config', 'solana', 'id.json');
    const secretKeyStr = fs.readFileSync(configPath, 'utf8');
    const secretKey = Uint8Array.from(JSON.parse(secretKeyStr));
    const authority = Keypair.fromSecretKey(secretKey);

    // Load oracle keypair for oracle_authority
    const oracleKeyPath = path.join(__dirname, '..', 'oracle-keypair.json');
    let oracleAuthority = authority.publicKey; // default to dev wallet
    if (fs.existsSync(oracleKeyPath)) {
        const oracleSecretStr = fs.readFileSync(oracleKeyPath, 'utf8');
        const oracleSecret = Uint8Array.from(JSON.parse(oracleSecretStr));
        const oracleKeypair = Keypair.fromSecretKey(oracleSecret);
        oracleAuthority = oracleKeypair.publicKey;
        console.log(`  Using oracle authority: ${oracleAuthority.toBase58()}`);
    } else {
        console.warn(`  Oracle keypair not found at ${oracleKeyPath}, using dev wallet as oracle_authority`);
    }

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const wallet = new anchor.Wallet(authority);
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    anchor.setProvider(provider);

    // Programs
    const akariIdl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
    const akariProgram = new anchor.Program(akariIdl, provider);

    const hookIdl = JSON.parse(fs.readFileSync(hookIdlPath, 'utf8'));
    const hookProgram = new anchor.Program(hookIdl, provider);

    console.log("1. Initialize PoolVault");
    const [poolVaultPda] = PublicKey.findProgramAddressSync([Buffer.from('pool_vault')], akariProgram.programId);
    
    // We assume pool_vault might already exist. We should check.
    const poolInfo = await connection.getAccountInfo(poolVaultPda);
    if (!poolInfo) {
        // args: oracle_authority, travel_rule_threshold, daily_limit_usdc, max_slippage_bps
        await akariProgram.methods.initializePool(
            oracleAuthority,
            new anchor.BN(1000 * 1_000_000), // 1000 USDC threshold
            new anchor.BN(50_000 * 1_000_000), // 50k USDC limit
            100 // 1%
        )
        .accounts({
            poolVault: poolVaultPda,
            authority: authority.publicKey,
            systemProgram: SystemProgram.programId,
        }).rpc();
        console.log("  => PoolVault initialized");
    } else {
        console.log("  => PoolVault already exists");
        // Check if oracle_authority needs to be updated
        try {
            const poolAccount = await akariProgram.account.poolVault.fetch(poolVaultPda);
            if (poolAccount.oracleAuthority.toBase58() !== oracleAuthority.toBase58()) {
                console.log(`  Updating oracle_authority from ${poolAccount.oracleAuthority.toBase58()} to ${oracleAuthority.toBase58()}`);
                await akariProgram.methods.updateOracleAuthority(oracleAuthority)
                    .accounts({
                        poolVault: poolVaultPda,
                        authority: authority.publicKey,
                    }).rpc();
                console.log("  => Oracle authority updated");
            } else {
                console.log("  => Oracle authority already correct");
            }
        } catch (e) {
            console.error("  Failed to fetch or update pool vault:", e);
        }
    }

    console.log("2. Initialize OracleRelayLock");
    const [relayLockPda] = PublicKey.findProgramAddressSync([Buffer.from('oracle_relay_lock')], akariProgram.programId);
    const lockInfo = await connection.getAccountInfo(relayLockPda);
    if (!lockInfo) {
        await akariProgram.methods.initializeOracleRelayLock()
        .accounts({
            oracleRelayLock: relayLockPda,
            authority: authority.publicKey,
            systemProgram: SystemProgram.programId
        }).rpc();
        console.log("  => OracleRelayLock initialized (TTL=60s)");
    } else {
        console.log("  => OracleRelayLock already exists");
    }

    console.log("3. Initialize EpochStates");
    for (const pair of ['EUR_USDP', 'CHF_USDP']) {
        const pairBuf = Buffer.from(pair);
        const [epochPda] = PublicKey.findProgramAddressSync([Buffer.from('epoch_state'), pairBuf], akariProgram.programId);
        const epochInfo = await connection.getAccountInfo(epochPda);
        if (!epochInfo) {
            await akariProgram.methods.initializeEpochState(
                Array.from(pairBuf),
                new anchor.BN(86400), // 1 day
                200 // 2% max slippage
            )
            .accounts({
                epochState: epochPda,
                poolVault: poolVaultPda,
                authority: authority.publicKey,
                systemProgram: SystemProgram.programId
            }).rpc();
            console.log(`  => EpochState ${pair} initialized`);
        } else {
             console.log(`  => EpochState ${pair} already exists`);
        }
    }

    console.log("\nSetup complete! You still need to mint Token-2022 equivalents.");
    console.log("Use `spl-token create-token --program-2022` to create the currencies.");
}

main().catch(console.error);
