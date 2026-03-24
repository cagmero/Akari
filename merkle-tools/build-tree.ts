import fs from 'fs';
import { sha256 } from '@noble/hashes/sha256';
import { PublicKey } from '@solana/web3.js';

function sortAndHash(left: Uint8Array, right: Uint8Array): Uint8Array {
    const combined = new Uint8Array(64);
    if (Buffer.compare(Buffer.from(left), Buffer.from(right)) <= 0) {
        combined.set(left, 0);
        combined.set(right, 32);
    } else {
        combined.set(right, 0);
        combined.set(left, 32);
    }
    return sha256(combined);
}

function buildTree(leaves: Uint8Array[]): any {
    if (leaves.length === 0) return { root: new Uint8Array(32), nodes: [] };

    let currentLevel: { hash: Uint8Array, left?: string, right?: string }[] = leaves.map(leaf => ({ hash: leaf }));
    const tree = [currentLevel];

    while (currentLevel.length > 1) {
        const nextLevel: { hash: Uint8Array, left?: string, right?: string }[] = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i].hash;
            const right = i + 1 < currentLevel.length ? currentLevel[i + 1].hash : left;
            nextLevel.push({
                hash: sortAndHash(left, right),
                left: Buffer.from(left).toString('hex'),
                right: Buffer.from(right).toString('hex'),
            });
        }
        tree.push(nextLevel);
        currentLevel = nextLevel;
    }

    return {
        root: Buffer.from(currentLevel[0].hash).toString('hex'),
        tree: tree.map(level => level.map(n => ({
            hash: Buffer.from(n.hash).toString('hex'),
            left: n.left,
            right: n.right
        }))),
    };
}

async function main() {
    const data = fs.readFileSync('./wallet-list.json', 'utf8');
    const wallets = JSON.parse(data) as string[];

    // ENFORCE STRICT 8 WALLET LIMIT (Merkle Compute Fix)
    if (wallets.length > 8) {
        throw new Error("STRICT LIMIT EXCEEDED: The Akari Merkle tree is limited to exactly 8 wallets to guarantee a maximum 3-level depth for compute budget safety.");
    }

    console.log(`Building tree with ${wallets.length} wallets (Max depth <= 3 guaranteed).`);

    const leaves = wallets.map(address => {
        const pubkey = new PublicKey(address);
        return sha256(pubkey.toBytes());
    });

    const result = buildTree(leaves);

    fs.writeFileSync('./tree-output.json', JSON.stringify({
        root: result.root,
        leafCount: leaves.length,
        tree: result.tree,
        wallets: wallets
    }, null, 2));

    console.log('Tree built and root computed successfully:', result.root);
}

main().catch(console.error);
