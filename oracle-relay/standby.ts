import * as anchor from '@coral-xyz/anchor';
import { Connection, Keypair } from '@solana/web3.js';
import fs from 'fs';
import { acquireOrRenewLock } from './leader-election';
import dotenv from 'dotenv';
dotenv.config();

const STANDBY_KEY_PATH = process.env.STANDBY_KEY_PATH || '../standby-keypair.json';
const IDL_PATH = '../app/src/idl/akari.json';

async function main() {
    console.log("Starting Standby Oracle Relay Service...");
    
    if (!fs.existsSync(STANDBY_KEY_PATH)) {
        throw new Error(`Standby keypair not found at ${STANDBY_KEY_PATH}`);
    }
    
    const secretKeyString = fs.readFileSync(STANDBY_KEY_PATH, { encoding: 'utf8' });
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

    let isRunning = true;
    let fallbackAsPrimary = false;
    process.on('SIGINT', () => {
        console.log("Shutting down Standby Oracle gracefully...");
        isRunning = false;
    });

    while (isRunning) {
        try {
            const hasLock = await acquireOrRenewLock(program, wallet);
            if (hasLock && !fallbackAsPrimary) {
                console.log("[Standby] \u26A0\uFE0F ATTENTION \u26A0\uFE0F Acquired lock! Primary has failed.");
                console.log("[Standby] Taking over as Primary Oracle. (Real impl extends index.ts logic here)");
                fallbackAsPrimary = true;
            } else if (hasLock && fallbackAsPrimary) {
                console.log("[Standby] Successfully renewed lock as fallback primary.");
            } else {
                 console.log("[Standby] Lock is healthy. Primary is operating normally. Sleeping 15s...");
                 fallbackAsPrimary = false;
            }
        } catch (e: any) {
             console.error(`[Standby] Error:`, e.message);
        }

        if (isRunning) {
            await new Promise(r => setTimeout(r, 15000));
        }
    }
}

main().catch(console.error);
