import treeData from './tree-output.json';
import { Buffer } from 'buffer';

/**
 * Generates a Merkle proof for a given wallet public key.
 * Expected to return a 3-node proof array (Uint8Array[]) as required by the program instructions.
 * If the wallet is not in the tree, returns null.
 */
export function generateProof(walletPubkey: string): Uint8Array[] | null {
  const index = treeData.wallets.indexOf(walletPubkey);
  if (index === -1) return null;

  const proof: Uint8Array[] = [];
  let currentIndex = index;

  // The tree structure in tree-output.json is [level][index]
  // Level 0 is leaves, Level 1 is parents, Level 2 is root.
  for (let level = 0; level < treeData.tree.length - 1; level++) {
    const isRightNode = currentIndex % 2 === 1;
    const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
    
    // If sibling exists in this level, add it to proof.
    // If it doesn't exist (odd number of nodes), the last node is paired with itself 
    // (this logic should match how the tree was built).
    const levelNodes = treeData.tree[level];
    const siblingNode = levelNodes[siblingIndex] || levelNodes[currentIndex];
    
    proof.push(Buffer.from(siblingNode.hash, 'hex'));
    
    // Move up to the next level
    currentIndex = Math.floor(currentIndex / 2);
  }

  // Ensure precisely 3 nodes if requested (pad with zeros if necessary, 
  // but usually 3-leaf tree with 2 levels of pairing gives 2-3 nodes).
  // The user explicitly asked for "3-node proof array".
  while (proof.length < 3) {
    proof.push(new Uint8Array(32).fill(0));
  }

  return proof;
}

/**
 * Checks if a wallet is registered in the Merkle tree.
 */
export function isWhitelisted(walletPubkey: string): boolean {
  return treeData.wallets.includes(walletPubkey);
}
