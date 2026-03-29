import fs from 'fs';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import os from 'os';
import path from 'path';

async function main() {
    // 1. Read the newly built tree root & leafCount
    const treeDataPath = './tree-output.json';
    if (!fs.existsSync(treeDataPath)) {
        throw new Error(`${treeDataPath} not found. Run \`npx ts-node build-tree.ts\` first.`);
    }

    const data = JSON.parse(fs.readFileSync(treeDataPath, 'utf8'));
    const rootHex = data.root;
    const leafCount = new anchor.BN(data.leafCount);
    const rootBuffer = Buffer.from(rootHex, 'hex');

    // Root must be [u8; 32]
    if (rootBuffer.length !== 32) {
        throw new Error(`Invalid root length: ${rootBuffer.length} bytes. Expected 32 bytes.`);
    }
    const rootBytes = Array.from(rootBuffer);

    // 2. Setup Anchor connection targeting Devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Load local deployer wallet
    const keyPairPath = path.join(os.homedir(), '.config', 'solana', 'id.json');
    if (!fs.existsSync(keyPairPath)) {
        throw new Error(`Wallet not found at ${keyPairPath}`);
    }
    const secretKeyString = fs.readFileSync(keyPairPath, { encoding: 'utf8' });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const authority = Keypair.fromSecretKey(secretKey);

    const wallet = new anchor.Wallet(authority);
    const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
    });
    anchor.setProvider(provider);

    // 3. Load Transfer Hook Program
    const idlPath = '../app/src/idl/transfer_hook.json';
    if (!fs.existsSync(idlPath)) {
        throw new Error(`IDL not found at ${idlPath}. Did you copy it yet?`);
    }
    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
    const programId = new PublicKey(idl.address);
    const program = new anchor.Program(idl, provider);

    // 4. Determine KycMerkleRoot PDA
    // Seed: ["kyc_root"]
    const [kycRootPda, kycBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('kyc_root')],
        programId
    );

    console.log("Preparing to update KycMerkleRoot PDA...");
    console.log("Root Hash:", rootHex);
    console.log("Leaf Count:", leafCount.toString());
    console.log("Authority:", authority.publicKey.toBase58());
    console.log("Kyc Root PDA:", kycRootPda.toBase58());

    // 5. Check if PDA exists first (to branch into init vs update maybe? Wait, program initializes elsewhere?)
    // Ah, the Transfer Hook program handles initialization lazily or requires explicit init?
    // Let's check if the KycMerkleRoot PDA has an init inside the program or if `update_kyc_root` initializes it using `init_if_needed`.
    // Actually, `update_kyc_root` uses `init_if_needed`!
    
    // Send Transaction
    try {
        const tx = await program.methods
            .updateKycRoot(rootBytes, leafCount)
            .accounts({
                kycMerkleRoot: kycRootPda,
                authority: authority.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        console.log(`\u2705 KycMerkleRoot perfectly updated on Devnet!`);
        console.log(`Transaction Signature: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    } catch (e) {
        console.error("Failed to update root:", e);
    }
}

main().catch(console.error);
