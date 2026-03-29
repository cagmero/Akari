import { useMemo } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import AkariIDL from '../idl/akari.json';
import DevnetAddresses from '../devnet-addresses.json';

export const AKARI_PROGRAM_ID = new PublicKey(DevnetAddresses.AKARI);
export const USDC_MINT = new PublicKey(DevnetAddresses.USDC_MINT);
export const EURC_MINT = new PublicKey(DevnetAddresses.EURC_MINT);
export const CHFC_MINT = new PublicKey(DevnetAddresses.CHFC_MINT);

export function useAkari() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const provider = useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection, wallet, {
      preflightCommitment: 'confirmed',
      commitment: 'confirmed',
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(AkariIDL as any, provider);
  }, [provider]);

  return {
    connection,
    wallet,
    provider,
    program,
  };
}
