import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Akari } from "../target/types/akari";
import { PublicKey, Keypair } from "@solana/web3.js";
import { expect } from "chai";
import assert from "assert";

describe("oracle-relay-lock", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.akari as Program<Akari>;

    let lockPda: PublicKey;
    let owner: Keypair;
    let relay2: Keypair;

    before(async () => {
        owner = (provider.wallet as anchor.Wallet).payer;
        relay2 = Keypair.generate();

        // Airdrop to relay2
        const sig = await provider.connection.requestAirdrop(relay2.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
        await provider.connection.confirmTransaction(sig);

        [lockPda] = PublicKey.findProgramAddressSync([Buffer.from("oracle_relay_lock")], program.programId);
        
        // Initialize the lock with TTL = 6
        // We initialize with a tiny TTL to make the time-based test fast without hanging CI!
        await program.methods.initializeOracleRelayLock().accounts({
            authority: owner.publicKey,
        }).rpc();
    });

    it("should succeed on first acquire_relay_lock", async () => {
        await program.methods.acquireRelayLock().accounts({
            caller: owner.publicKey,
        }).rpc();

        const lock = await program.account.oracleRelayLock.fetch(lockPda);
        expect(lock.holder.toBase58()).to.equal(owner.publicKey.toBase58());
        expect(lock.renewalCount).to.equal(1);
    });

    it("should fail if a second relay attempts acquisition while lock is still valid", async () => {
        try {
            await program.methods.acquireRelayLock().accounts({
                caller: relay2.publicKey,
            }).signers([relay2]).rpc();
            assert.fail("Should have failed");
        } catch (err: any) {
            expect(err.message).to.include("OracleRelayLockHeld");
        }
    });

    it("should allow the current holder to renew_relay_lock", async () => {
        // Just renewing immediately to test it works
        await program.methods.renewRelayLock().accounts({
            caller: owner.publicKey,
        }).rpc();

        const lock = await program.account.oracleRelayLock.fetch(lockPda);
        expect(lock.renewalCount).to.equal(1); // the instruction logic doesn't explicitly increment renewal count natively on renew, just extends time
    });

    it("should revert if non-holder tries to renew", async () => {
        try {
            await program.methods.renewRelayLock().accounts({
                caller: relay2.publicKey,
            }).signers([relay2]).rpc();
            assert.fail("Should have failed");
        } catch (err: any) {
            expect(err.message).to.include("NotOracleRelayLockHolder");
        }
    });

    it("should allow second relay to acquire after TTL expires", async () => {
        console.log("Waiting 62 seconds for custom TTL expiration...");
        // Wait 62 seconds
        await new Promise(r => setTimeout(r, 62000));

        await program.methods.acquireRelayLock().accounts({
            caller: relay2.publicKey,
        }).signers([relay2]).rpc();

        const lock = await program.account.oracleRelayLock.fetch(lockPda);
        expect(lock.holder.toBase58()).to.equal(relay2.publicKey.toBase58());
        expect(lock.renewalCount).to.equal(2); 
    });
});
