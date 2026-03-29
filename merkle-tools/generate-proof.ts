import fs from 'fs';
import { PublicKey } from '@solana/web3.js';
import crypto from 'crypto';

async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        throw new Error("Usage: npx ts-node generate-proof.ts <wallet_pubkey>");
    }
    const targetWallet = args[0];

    const data = fs.readFileSync('./tree-output.json', 'utf8');
    const { tree, wallets } = JSON.parse(data);

    const index = wallets.indexOf(targetWallet);
    if (index === -1) {
        throw new Error(`Wallet ${targetWallet} not found in the Merkle tree.`);
    }

    console.log(`Generating proof for wallet at index ${index}: ${targetWallet}`);

    const proof: string[] = [];
    let currentIndex = index;

    // tree.length - 1 is the root, we don't need a sibling for the root
    for (let level = 0; level < tree.length - 1; level++) {
        const isLeftNode = currentIndex % 2 === 0;
        const siblingIndex = isLeftNode ? currentIndex + 1 : currentIndex - 1;
        
        let siblingNode = tree[level][siblingIndex];
        if (!siblingNode) {
            // In case of odd number of nodes, we duplicate the last node
            siblingNode = tree[level][currentIndex];
        }

        proof.push(siblingNode.hash);
        currentIndex = Math.floor(currentIndex / 2);
    }

    console.log("Proof (array of hex strings):");
    console.log(JSON.stringify(proof, null, 2));

    // Verify locally as a sanity check
    let currentHash = crypto.createHash('sha256').update(new PublicKey(targetWallet).toBytes()).digest('hex');
    for (const siblingHash of proof) {
        const left = Buffer.from(currentHash, 'hex');
        const right = Buffer.from(siblingHash, 'hex');
        
        const combined = new Uint8Array(64);
        if (Buffer.compare(left, right) <= 0) {
            combined.set(left, 0);
            combined.set(right, 32);
        } else {
            combined.set(right, 0);
            combined.set(left, 32);
        }
        currentHash = crypto.createHash('sha256').update(combined).digest('hex');
    }

    const rootHash = tree[tree.length - 1][0].hash;
    if (currentHash === rootHash) {
        console.log("Local verification SUCCESS \u2705");
    } else {
        console.log("Local verification FAILED \u274c");
        console.log("Calculated:", currentHash);
        console.log("Expected:  ", rootHash);
    }
}

main().catch(console.error);
