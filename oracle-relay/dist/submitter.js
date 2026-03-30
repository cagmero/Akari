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
exports.submitPriceOnChain = submitPriceOnChain;
const anchor = __importStar(require("@coral-xyz/anchor"));
async function submitPriceOnChain(program, wallet, currencyPair, bid, ask, mid, spreadBps, publishedAt) {
    try {
        const pairBuf = Buffer.from(currencyPair);
        if (pairBuf.length !== 8) {
            throw new Error(`Currency pair must be exactly 8 chars. Got: ${currencyPair}`);
        }
        const pairBytes = Array.from(pairBuf);
        const [priceFeedPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from('six_price_feed'), pairBuf], program.programId);
        const [poolVaultPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from('pool_vault')], program.programId);
        const [relayLockPda] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from('oracle_relay_lock')], program.programId);
        const tx = await program.methods.updateFxRate(pairBytes, new anchor.BN(bid), new anchor.BN(ask), new anchor.BN(mid), spreadBps, new anchor.BN(publishedAt)).accounts({
            oracleAuthority: wallet.publicKey,
            sixPriceFeed: priceFeedPda,
            poolVault: poolVaultPda,
            oracleRelayLock: relayLockPda,
            systemProgram: anchor.web3.SystemProgram.programId,
        }).rpc();
        console.log(`[Submitter] Successfully updated ${currencyPair} | Mid: ${mid / 1000000} | Spread: ${spreadBps}bps | Tx: ${tx}`);
        return tx;
    }
    catch (e) {
        console.error(`[Submitter] Error updating ${currencyPair}:`, e.message);
        return null;
    }
}
