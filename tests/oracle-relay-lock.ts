import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Akari } from "../target/types/akari";
import { startAnchor } from "anchor-bankrun";
import { PublicKey, Keypair } from "@solana/web3.js";
import { expect } from "chai";
import { Clock } from "solana-bankrun";
import assert from "assert";

describe("oracle-relay-lock", () => {
    let program: Program<Akari>;
    let provider: anchor.AnchorProvider;
    let context: any;
    let lockPda: PublicKey;
    let owner: Keypair;
    let relay2: Keypair;

    before(async () => {
        context = await startAnchor("", [{ name: "akari", programId: new PublicKey("82NUzodyAhrWgpjCZ1LxfRCsD425i3KeqgeN6xbCQeux") }], []);
        provider = new anchor.AnchorProvider(context.connection, new anchor.Wallet(context.payer), {});
        anchor.setProvider(provider);
        program = anchor.workspace.akari as Program<Akari>;

        owner = context.payer;
        relay2 = Keypair.generate();

        [lockPda] = PublicKey.findProgramAddressSync([Buffer.from("oracle_relay_lock")], program.programId);
        
        // Initialize the lock with TTL = 60
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
        // Ensure renewed
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
        // Time travel!
        const currentClock = await context.banksClient.getClock();
        const newClock = new Clock(
            currentClock.slot,
            currentClock.epochStartTimestamp,
            currentClock.epoch,
            currentClock.leaderScheduleEpoch,
            // Fast forward 61 seconds to exceed the 60s TTL
            BigInt(Number(currentClock.unixTimestamp) + 61)
        );
        
        // This is exactly program_test::set_sysvar over bankrun
        context.setClock(newClock);

        await program.methods.acquireRelayLock().accounts({
            caller: relay2.publicKey,
        }).signers([relay2]).rpc();

        const lock = await program.account.oracleRelayLock.fetch(lockPda);
        expect(lock.holder.toBase58()).to.equal(relay2.publicKey.toBase58());
        expect(lock.renewalCount).to.equal(3); // initialized, acquired(1), renewed(2), acquired(3)
    });
});
