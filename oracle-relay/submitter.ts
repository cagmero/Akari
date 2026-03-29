import * as anchor from '@coral-xyz/anchor';

export async function submitPriceOnChain(
    program: anchor.Program,
    wallet: anchor.Wallet,
    currencyPair: string,
    bid: number,
    ask: number,
    mid: number,
    spreadBps: number,
    publishedAt: number
): Promise<string | null> {
    try {
        const pairBuf = Buffer.from(currencyPair);
        if (pairBuf.length !== 8) {
            throw new Error(`Currency pair must be exactly 8 chars. Got: ${currencyPair}`);
        }
        const pairBytes = Array.from(pairBuf);

        const [priceFeedPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from('six_price_feed'), pairBuf],
            program.programId
        );

        const [poolVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from('pool_vault')],
            program.programId
        );

        const [relayLockPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from('oracle_relay_lock')],
            program.programId
        );

        const tx = await program.methods.updateFxRate(
            pairBytes,
            new anchor.BN(bid),
            new anchor.BN(ask),
            new anchor.BN(mid),
            spreadBps,
            new anchor.BN(publishedAt)
        ).accounts({
            oracleAuthority: wallet.publicKey,
            sixPriceFeed: priceFeedPda,
            poolVault: poolVaultPda,
            oracleRelayLock: relayLockPda,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).rpc();

        console.log(`[Submitter] Successfully updated ${currencyPair} | Mid: ${mid/1000000} | Spread: ${spreadBps}bps | Tx: ${tx}`);
        return tx;
    } catch (e: any) {
        console.error(`[Submitter] Error updating ${currencyPair}:`, e.message);
        return null;
    }
}
