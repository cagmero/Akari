import useSWR from 'swr';
import { useAkari } from './useAkari';
import { getOracleRelayLockPda } from '../lib/constants';

export function useOracleRelayStatus() {
  const { program } = useAkari();
  const pda = getOracleRelayLockPda();

  const fetcher = async () => {
    if (!program) return null;
    return await program.account.oracleRelayLock.fetch(pda);
  };

  const { data, error, isLoading, mutate } = useSWR(
    program ? ['oracleRelayLock', pda.toBase58()] : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  return {
    oracleRelayLock: data,
    isLoading,
    isError: error,
    mutate
  };
}
