"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.acquireOrRenewLock = acquireOrRenewLock;
const anchor = __importStar(require("@coral-xyz/anchor"));
async function acquireOrRenewLock(program, wallet) {
    try {
        const [relayLockPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from('oracle_relay_lock')], program.programId);
        let lockAccount;
        try {
            lockAccount = await program.account.oracleRelayLock.fetch(relayLockPda);
        }
        catch (e) {
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
        }
        else if (expired) {
            // acquire
            await program.methods.acquireRelayLock().accounts({
                oracleRelayLock: relayLockPda,
                authority: wallet.publicKey,
            }).rpc();
            console.log(`[Relay] Acquired expired lock from previous holder.`);
            return true;
        }
        else {
            console.log(`[Relay] Lock currently held by ${holder}. Expiring in ${ttl - (now - acquiredAt)}s`);
            return false;
        }
    }
    catch (e) {
        console.error(`[LeaderElection] Error:`, e.message);
        return false;
    }
}
