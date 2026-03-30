import useSWR from 'swr';
import { useAkari } from './useAkari';
import { getPoolVaultPda } from '../lib/constants';

export function usePool() {
  const { program } = useAkari();
  const poolVaultPda = getPoolVaultPda();

  const fetcher = async () => {
    if (!program) return null;
    return await program.account.poolVault.fetch(poolVaultPda);
  };

  const { data, error, isLoading, mutate } = useSWR(
    program ? ['poolVault', poolVaultPda.toBase58()] : null,
    fetcher,
    { refreshInterval: 10000 } // Auto-poll every 10s
  );

  return {
    poolVault: data,
    isLoading,
    isError: error,
    mutate
  };
}
