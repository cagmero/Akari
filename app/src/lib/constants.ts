import { PublicKey } from "@solana/web3.js";
import addresses from "../devnet-addresses.json";

export const DEVNET_ADDRESSES = addresses;

export const AKARI_PROGRAM_ID = new PublicKey(addresses.AKARI);
export const PROGRAM_ID = AKARI_PROGRAM_ID;
export const USDC_MINT = new PublicKey(addresses.USDC_MINT);
export const EURC_MINT = new PublicKey(addresses.EURC_MINT);
export const CHFC_MINT = new PublicKey(addresses.CHFC_MINT);

// PDA Derivations
export const getPoolVaultPda = () => {
  return PublicKey.findProgramAddressSync([Buffer.from("pool_vault")], PROGRAM_ID)[0];
};

export const getEpochStatePda = (currencyPair: string) => {
  if (!currencyPair) return null as any;
  // e.g. "EUR_USDP"
  return PublicKey.findProgramAddressSync(
    [Buffer.from("epoch_state"), Buffer.from(currencyPair)],
    PROGRAM_ID
  )[0];
};

export const getSixPriceFeedPda = (currencyPair: string) => {
  if (!currencyPair) return null as any;
  return PublicKey.findProgramAddressSync(
    [Buffer.from("six_price_feed"), Buffer.from(currencyPair)],
    PROGRAM_ID
  )[0];
};

export const getOracleRelayLockPda = () => {
  return PublicKey.findProgramAddressSync([Buffer.from("oracle_relay_lock")], PROGRAM_ID)[0];
};

export const getSubsidiaryPda = (ownerPubkey: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("subsidiary"), ownerPubkey.toBuffer()],
    PROGRAM_ID
  )[0];
};

export const getYieldPositionPda = (currency: number, venue: string) => {
  // currency (u8), venue ([u8; 16])
  const venueBuffer = Buffer.from(venue.padEnd(16, "\0"));
  return PublicKey.findProgramAddressSync(
    [Buffer.from("yield_position"), Buffer.from([currency]), venueBuffer],
    PROGRAM_ID
  )[0];
};
