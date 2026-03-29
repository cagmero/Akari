import * as anchor from '@coral-xyz/anchor';

export async function acquireOrRenewLock(
    program: anchor.Program,
    wallet: anchor.Wallet
): Promise<boolean> {
    try {
        const [relayLockPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from('oracle_relay_lock')],
            program.programId
        );

        let lockAccount;
        try {
            lockAccount = await (program.account as any).oracleRelayLock.fetch(relayLockPda);
        } catch (e: any) {
            if (e.message && e.message.includes('Account does not exist')) {
                console.error("OracleRelayLock PDA does not exist. Must be initialized.");
                return false;
            }
            throw e; 
        }

        const now = Math.floor(Date.now() / 1000);
        const holder = lockAccount.holder.toBase58();
        const me = wallet.publicKey.toBase58();
        
        const acquiredAt = lockAccount.acquiredAt.toNumber();
        const ttl = lockAccount.ttl; // e.g. 60
        const expired = (now - acquiredAt) >= ttl;

        if (holder === me) {
            // renew
            await program.methods.renewRelayLock().accounts({
                oracleRelayLock: relayLockPda,
                authority: wallet.publicKey,
            }).rpc();
            return true;
        } else if (expired) {
            // acquire
            await program.methods.acquireRelayLock().accounts({
                oracleRelayLock: relayLockPda,
                authority: wallet.publicKey,
            }).rpc();
            console.log(`[Relay] Acquired expired lock from previous holder.`);
            return true;
        } else {
            console.log(`[Relay] Lock currently held by ${holder}. Expiring in ${ttl - (now - acquiredAt)}s`);
            return false;
        }
    } catch (e: any) {
        console.error(`[LeaderElection] Error:`, e.message);
        return false;
    }
}
