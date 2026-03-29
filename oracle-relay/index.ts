import * as anchor from '@coral-xyz/anchor';
import { Connection, Keypair } from '@solana/web3.js';
import fs from 'fs';
import { SixClient } from './six-client';
import { acquireOrRenewLock } from './leader-election';
import { submitPriceOnChain } from './submitter';
import dotenv from 'dotenv';
dotenv.config();

const ORACLE_KEY_PATH = process.env.ORACLE_KEY_PATH || '../oracle-keypair.json';
const IDL_PATH = '../app/src/idl/akari.json';
const PAIRS = [
    { code: '946681_149', pdaSeed: 'EUR_USDP' },
    { code: '275164_149', pdaSeed: 'CHF_USDP' }
];

async function main() {
    console.log("Starting Primary Oracle Relay Service (SIX \u2192 Solana)...");
    
    if (!fs.existsSync(ORACLE_KEY_PATH)) {
        throw new Error(`Oracle keypair not found at ${ORACLE_KEY_PATH}`);
    }
    
    const secretKeyString = fs.readFileSync(ORACLE_KEY_PATH, { encoding: 'utf8' });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const wallet = new anchor.Wallet(Keypair.fromSecretKey(secretKey));

    const connection = new Connection(process.env.RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    anchor.setProvider(provider);

    if (!fs.existsSync(IDL_PATH)) {
        throw new Error(`IDL not found at ${IDL_PATH}`);
    }
    
    const idl = JSON.parse(fs.readFileSync(IDL_PATH, 'utf8'));
    const program = new anchor.Program(idl, provider);
    const sixClient = new SixClient();

    let isRunning = true;
    process.on('SIGINT', () => {
        console.log("Shutting down Primary Oracle gracefully...");
        isRunning = false;
    });

    while (isRunning) {
        try {
            const hasLock = await acquireOrRenewLock(program, wallet);
            if (!hasLock) {
                console.log("[Relay] Entering standby mode. Lock held by another instance. Waiting for next cycle...");
            } else {
                for (const pair of PAIRS) {
                    const price = await sixClient.fetchFxRates(pair.code);
                    await submitPriceOnChain(
                        program,
                        wallet,
                        pair.pdaSeed,
                        price.bid,
                        price.ask,
                        price.mid,
                        price.spread_bps,
                        price.timestamp
                    );
                }
                const gold = await sixClient.fetchGoldPrice();
                console.log(`[Relay] Fetched Gold Price: $${gold.price}`);
            }
        } catch (e: any) {
             console.error(`[Relay] Loop Error:`, e.message);
        }

        if (isRunning) {
            console.log("Sleeping 30s before next oracle tick...");
            await new Promise(r => setTimeout(r, 30000));
        }
    }
}

main().catch(console.error);
