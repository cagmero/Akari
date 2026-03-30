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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const fs_1 = __importDefault(require("fs"));
const six_client_1 = require("./six-client");
const leader_election_1 = require("./leader-election");
const submitter_1 = require("./submitter");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ORACLE_KEY_PATH = process.env.ORACLE_KEY_PATH || '../oracle-keypair.json';
const IDL_PATH = '../app/src/idl/akari.json';
const PAIRS = [
    { code: '946681_149', pdaSeed: 'EUR_USDP' },
    { code: '275164_149', pdaSeed: 'CHF_USDP' }
];
async function main() {
    console.log("Starting Primary Oracle Relay Service (SIX \u2192 Solana)...");
    if (!fs_1.default.existsSync(ORACLE_KEY_PATH)) {
        throw new Error(`Oracle keypair not found at ${ORACLE_KEY_PATH}`);
    }
    const secretKeyString = fs_1.default.readFileSync(ORACLE_KEY_PATH, { encoding: 'utf8' });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const wallet = new anchor.Wallet(web3_js_1.Keypair.fromSecretKey(secretKey));
    const connection = new web3_js_1.Connection(process.env.RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    anchor.setProvider(provider);
    if (!fs_1.default.existsSync(IDL_PATH)) {
        throw new Error(`IDL not found at ${IDL_PATH}`);
    }
    const idl = JSON.parse(fs_1.default.readFileSync(IDL_PATH, 'utf8'));
    const program = new anchor.Program(idl, provider);
    const sixClient = new six_client_1.SixClient();
    let isRunning = true;
    process.on('SIGINT', () => {
        console.log("Shutting down Primary Oracle gracefully...");
        isRunning = false;
    });
    while (isRunning) {
        try {
            const hasLock = await (0, leader_election_1.acquireOrRenewLock)(program, wallet);
            if (!hasLock) {
                console.log("[Relay] Entering standby mode. Lock held by another instance. Waiting for next cycle...");
            }
            else {
                for (const pair of PAIRS) {
                    const price = await sixClient.fetchFxRates(pair.code);
                    await (0, submitter_1.submitPriceOnChain)(program, wallet, pair.pdaSeed, price.bid, price.ask, price.mid, price.spread_bps, price.timestamp);
                }
                const gold = await sixClient.fetchGoldPrice();
                console.log(`[Relay] Fetched Gold Price: $${gold.price}`);
            }
        }
        catch (e) {
            console.error(`[Relay] Loop Error:`, e.message);
        }
        if (isRunning) {
            console.log("Sleeping 30s before next oracle tick...");
            await new Promise(r => setTimeout(r, 30000));
        }
    }
}
main().catch(console.error);
