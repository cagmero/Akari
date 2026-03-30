import useSWR from 'swr';
import { useAkari } from './useAkari';
import { getYieldPositionPda } from '../lib/constants';

// For simplicity in the hackathon, we hardcode the 2 venues we support
export const YIELD_VENUES = [
  { currency: 0, name: 'kamino' },
  { currency: 0, name: 'marginfi' }
];

export function useYieldPositions() {
  const { program } = useAkari();

  const fetcher = async () => {
    if (!program) return [];
    
    const positions = await Promise.all(
      YIELD_VENUES.map(async (v) => {
        const pda = getYieldPositionPda(v.currency, v.name);
        try {
          const account = await program.account.yieldPosition.fetch(pda);
          return { pda, venue: v.name, account };
        } catch {
          return { pda, venue: v.name, account: null };
        }
      })
    );
    
    return positions;
  };

  const { data, error, isLoading, mutate } = useSWR(
    program ? ['yieldPositions'] : null,
    fetcher,
    { refreshInterval: 15000 }
  );

  return {
    positions: data || [],
    isLoading,
    isError: error,
    mutate
  };
}
