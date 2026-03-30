import { useEffect, useState, useRef } from "react";
import { useAkari } from "./useAkari";
import { AKARI_PROGRAM_ID } from "../lib/constants";
import * as anchor from "@coral-xyz/anchor";

export function useEvents() {
  const { provider, program } = useAkari();
  const [events, setEvents] = useState<any[]>([]);
  const eventsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!program || !provider) return;

    // Initial fetch of recent signatures
    const fetchHistory = async () => {
      try {
        const sigs = await provider.connection.getSignaturesForAddress(AKARI_PROGRAM_ID, { limit: 50 });
        // In a real app, you would fetch and parse transactions here.
        // For this MVP, we rely on the live subscription for the "Active Feed" 
        // and let the Audit page do the heavy historical lifting.
      } catch (e) {
        console.error("Failed to fetch event history", e);
      }
    };

    fetchHistory();

    // Subscribe to ALL program events using Anchor 
    // This parses the logs automatically based on the IDL
    const listenerId = program.addEventListener("TransferEvent", (event, slot, signature) => {
        handleNewEvent({ type: "Deposit", ...event, signature, time: Date.now() });
    });
    
    const listenerId2 = program.addEventListener("FxSwapEvent", (event, slot, signature) => {
        handleNewEvent({ type: "Swap", ...event, signature, time: Date.now() });
    });

    const listenerId3 = program.addEventListener("YieldDeployedEvent", (event, slot, signature) => {
        handleNewEvent({ type: "Yield", ...event, signature, time: Date.now() });
    });

    const handleNewEvent = (event: any) => {
        eventsRef.current = [event, ...eventsRef.current].slice(0, 20);
        setEvents([...eventsRef.current]);
    };

    return () => {
      program.removeEventListener(listenerId);
      program.removeEventListener(listenerId2);
      program.removeEventListener(listenerId3);
    };
  }, [program, provider]);

  return events;
}
