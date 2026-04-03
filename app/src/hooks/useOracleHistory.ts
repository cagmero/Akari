import { useRef, useEffect } from 'react';
import { useSixPrice } from './useSixPrice';

export function useOracleHistory(pair: string) {
  const { priceFeed } = useSixPrice(pair);
  const historyRef = useRef<{ price: number; timestamp: number }[]>([]);

  useEffect(() => {
    if (priceFeed) {
      const lastEntry = historyRef.current[historyRef.current.length - 1];
      if (!lastEntry || lastEntry.timestamp < priceFeed.submittedAt.toNumber()) {
        historyRef.current = [
          ...historyRef.current,
          { 
            price: priceFeed.mid.toNumber() / 1_000_000, 
            timestamp: priceFeed.submittedAt.toNumber() 
          }
        ].slice(-60); // Cap at 60 points
      }
    }
  }, [priceFeed]);

  return historyRef.current;
}
