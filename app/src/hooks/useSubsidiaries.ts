import useSWR from 'swr';
import { useAkari } from './useAkari';

export function useSubsidiaries() {
  const { program } = useAkari();

  const fetcher = async () => {
    if (!program) return [];
    // Fetch all subsidiary accounts
    return await program.account.subsidiaryAccount.all();
  };

  const { data, error, isLoading, mutate } = useSWR(
    program ? ['allSubsidiaries'] : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  return {
    subsidiaries: data || [],
    isLoading,
    isError: error,
    mutate
  };
}
