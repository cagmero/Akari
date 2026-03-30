import useSWR from 'swr';
import { useAkari } from './useAkari';
import { getSubsidiaryPda } from '../lib/constants';

export function useSubsidiary() {
  const { program, wallet } = useAkari();

  const fetcher = async () => {
    if (!program || !wallet) return null;
    const pda = getSubsidiaryPda(wallet.publicKey);
    try {
      return await program.account.subsidiaryAccount.fetch(pda);
    } catch {
      return null;
    }
  };

  const { data, error, isLoading, mutate } = useSWR(
    program && wallet ? ['subsidiary', wallet.publicKey.toBase58()] : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  const pda = wallet ? getSubsidiaryPda(wallet.publicKey) : null;

  return {
    subsidiary: data,
    subsidiaryPda: pda,
    isLoading,
    isError: error,
    mutate
  };
}
