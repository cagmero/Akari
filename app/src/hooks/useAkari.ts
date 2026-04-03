import { useMemo } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallets } from "@privy-io/react-auth/solana";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey, Connection } from '@solana/web3.js';
import AkariIDL from '../idl/akari.json';
import type { Akari } from '../idl/akari_type';
import DevnetAddresses from '../devnet-addresses.json';

export const AKARI_PROGRAM_ID = new PublicKey(DevnetAddresses.AKARI);
export const USDC_MINT = new PublicKey(DevnetAddresses.USDC_MINT);
export const EURC_MINT = new PublicKey(DevnetAddresses.EURC_MINT);
export const CHFC_MINT = new PublicKey(DevnetAddresses.CHFC_MINT);

export function useAkari() {
  const connection = useMemo(() => new Connection('https://api.devnet.solana.com', 'confirmed'), []);
  const { wallets } = useWallets();
  const wallet = wallets[0]; 

  const memoized = useMemo(() => {
    if (!wallet) return null;
    
    // Create an object that matches the Anchor Wallet interface
    const anchorWallet = {
      publicKey: new PublicKey(wallet.address),
      signTransaction: async (tx: any) => {
        const result = await wallet.signTransaction({ transaction: tx });
        return result.signedTransaction;
      },
      signAllTransactions: async (txs: any[]) => {
        return await Promise.all(txs.map(async (tx) => {
            const result = await wallet.signTransaction({ transaction: tx });
            return result.signedTransaction;
        }));
      },
    };

    return {
      provider: new AnchorProvider(connection, anchorWallet as any, {
        preflightCommitment: 'confirmed',
        commitment: 'confirmed',
      }),
      anchorWallet,
    };
  }, [connection, wallet]);

  const provider = memoized?.provider || null;
  const anchorWallet = memoized?.anchorWallet || null;

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(AkariIDL as Akari, provider);
  }, [provider]);

  return {
    connection,
    privyWallet: wallet,
    wallet: anchorWallet,
    provider,
    program: program as Program<Akari> | null,
  };
}
