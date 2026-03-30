import useSWR from 'swr';
import { useAkari } from './useAkari';
import { getEpochStatePda } from '../lib/constants';

export function useEpochState(currencyPair: string) {
  const { program } = useAkari();
  const pda = getEpochStatePda(currencyPair);

  const fetcher = async () => {
    if (!program) return null;
    return await program.account.epochState.fetch(pda);
  };

  const { data, error, isLoading, mutate } = useSWR(
    program ? ['epochState', currencyPair, pda.toBase58()] : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  return {
    epochState: data,
    isLoading,
    isError: error,
    mutate
  };
}
