"use server";

import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { createMintToInstruction, getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import fs from "fs";
import path from "path";
import DevnetAddresses from "../../devnet-addresses.json";

export async function airdropDemoUSDC(userPubkeyStr: string) {
    try {
        const userPubkey = new PublicKey(userPubkeyStr);
        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        
        // Load the keypair from local config for the developer demo
        const configPath = path.join(process.env.HOME || "", ".config", "solana", "id.json");
        const secretKeyStr = fs.readFileSync(configPath, "utf8");
        const secretKey = Uint8Array.from(JSON.parse(secretKeyStr));
        const authority = Keypair.fromSecretKey(secretKey);

        const mint = new PublicKey(DevnetAddresses.USDC_MINT);
        const ata = getAssociatedTokenAddressSync(mint, userPubkey, false, TOKEN_2022_PROGRAM_ID);

        const ataInfo = await connection.getAccountInfo(ata);
        const tx = new Transaction();

        if (!ataInfo) {
            tx.add(
                createAssociatedTokenAccountInstruction(
                    authority.publicKey,
                    ata,
                    userPubkey,
                    mint,
                    TOKEN_2022_PROGRAM_ID
                )
            );
        }

        tx.add(
            createMintToInstruction(
                mint,
                ata,
                authority.publicKey,
                1000 * 1_000_000, // 1000 USDC
                [],
                TOKEN_2022_PROGRAM_ID
            )
        );

        const sig = await sendAndConfirmTransaction(connection, tx, [authority], { commitment: "confirmed" });
        return { success: true, signature: sig };
    } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
    }
}
