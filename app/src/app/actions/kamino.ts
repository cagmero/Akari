// @ts-nocheck
"use server";

import { Connection, PublicKey } from "@solana/web3.js";
import {
  KaminoMarket,
  KaminoAction,
  VanillaObligation,
} from "@kamino-finance/klend-sdk";

export async function buildKaminoDeposit(amount: string) {
  const connection = new Connection("https://api.mainnet-beta.solana.com");

  const marketAddress = new PublicKey(
    "7u3HeHxYDLhnCoErrpiSYLSbSyNmEzT64P1jVpKrvdhh"
  );
  const usdcMint = new PublicKey(
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  );

  const market = await KaminoMarket.load(connection, marketAddress, 400);
  if (!market) throw new Error("Could not load Kamino Market");

  const poolVaultPda = new PublicKey(
    "82NUzodyAhrWgpjCZ1LxfRCsD425i3KeqgeN6xbCQeux"
  );

  const action = await KaminoAction.buildDepositTxns(
    market,
    amount,
    usdcMint,
    poolVaultPda,
    new VanillaObligation(market.programId)
  );

  const kaminoIx =
    action.setupIxs.length > 0
      ? action.setupIxs[0]
      : action.lendingIxs[0];

  return {
    dataLength: kaminoIx.data.length,
    accounts: kaminoIx.keys.map((k: any) => k.pubkey.toBase58()),
  };
}
