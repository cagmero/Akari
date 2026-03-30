import useSWR from 'swr';
import { useAkari } from './useAkari';
import { getSixPriceFeedPda } from '../lib/constants';

export function useSixPrice(currencyPair: string) {
  const { program } = useAkari();
  const pda = getSixPriceFeedPda(currencyPair);

  const fetcher = async () => {
    if (!program) return null;
    return await program.account.sixPriceFeed.fetch(pda);
  };

  const { data, error, isLoading, mutate } = useSWR(
    program ? ['sixPriceFeed', currencyPair, pda.toBase58()] : null,
    fetcher,
    { refreshInterval: 5000 } // Auto-poll every 5s for live ticker
  );

  return {
    priceFeed: data,
    isLoading,
    isError: error,
    mutate
  };
}
