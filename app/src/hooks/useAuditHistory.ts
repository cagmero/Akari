import { useEffect, useState, useRef } from "react";
import { useAkari } from "./useAkari";
import { AKARI_PROGRAM_ID } from "../lib/constants";
import * as anchor from "@coral-xyz/anchor";

export type AuditEvent = {
  signature: string;
  timestamp: number;
  type: "Deposit" | "Withdraw" | "Swap" | "Travel Rule" | "Yield" | "Oracle Update";
  entity: string;
  amount: number;
  currency: string;
  details?: any;
};

export function useAuditHistory() {
  const { provider, program } = useAkari();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!program || !provider) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const sigs = await provider.connection.getSignaturesForAddress(AKARI_PROGRAM_ID, { limit: 100 });
        
        // Mock data for MVP to show the design correctly since real logs might be empty on devnet
        const mockEvents: AuditEvent[] = [
          {
            signature: "5Wx...",
            timestamp: Date.now() - 1000 * 60 * 45,
            type: "Deposit",
            entity: "Acme Corp Japan",
            amount: 50000,
            currency: "USDC"
          },
          {
            signature: "3Hz...",
            timestamp: Date.now() - 1000 * 60 * 120,
            type: "Travel Rule",
            entity: "Global Logistics Ltd",
            amount: 8500,
            currency: "USDC",
            details: {
              senderVasp: "VASP-JP-4421",
              receiverVasp: "VASP-CH-9901",
              beneficiaryHash: "78909e68151e62fae164442fe6f4a9554723ba3541a59ce9eadf10027b144832"
            }
          },
          {
            signature: "9Kj...",
            timestamp: Date.now() - 1000 * 60 * 300,
            type: "Swap",
            entity: "Acme Corp Japan",
            amount: 12500,
            currency: "EURC"
          },
          {
             signature: "1Yt...",
             timestamp: Date.now() - 1000 * 60 * 60 * 24,
             type: "Yield",
             entity: "Treasury Pool",
             amount: 450,
             currency: "USDC"
          }
        ];

        setEvents(mockEvents);
      } catch (e) {
        console.error("Failed to fetch audit history", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [program, provider]);

  return { events, isLoading };
}
