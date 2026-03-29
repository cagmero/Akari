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
            authority.publicKey,
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
