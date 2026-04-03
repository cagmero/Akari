import { useEffect, useState, useRef } from "react";
import { useAkari } from "./useAkari";
import { AKARI_PROGRAM_ID } from "../lib/constants";
import * as anchor from "@coral-xyz/anchor";

export function useEvents() {
  const { provider, program } = useAkari();
  const [events, setEvents] = useState<any[]>([]);
  const eventsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!program || !provider?.connection) return;

    const fetchHistory = async () => {
      try {
        if (!provider?.connection) return;
        const sigs = await provider.connection.getSignaturesForAddress(AKARI_PROGRAM_ID, { limit: 50 });
      } catch (e) {
        console.error("Failed to fetch event history", e);
      }
    };

    fetchHistory();

    const handleNewEvent = (event: any) => {
        eventsRef.current = [event, ...eventsRef.current].slice(0, 20);
        setEvents([...eventsRef.current]);
    };

    let listenerId: number | null = null;
    let listenerId2: number | null = null;
    let listenerId3: number | null = null;

    try {
        listenerId = program.addEventListener("transferEvent", (event, slot, signature) => {
            handleNewEvent({ type: "Deposit", ...event, signature, time: Date.now() });
        });
        
        listenerId2 = program.addEventListener("fxSwapEvent", (event, slot, signature) => {
            handleNewEvent({ type: "Swap", ...event, signature, time: Date.now() });
        });

        listenerId3 = program.addEventListener("yieldDeployedEvent", (event, slot, signature) => {
            handleNewEvent({ type: "Yield", ...event, signature, time: Date.now() });
        });
    } catch (e) {
        console.error("Failed to setup event listeners", e);
    }

    return () => {
      if (program) {
        if (listenerId !== null) program.removeEventListener(listenerId);
        if (listenerId2 !== null) program.removeEventListener(listenerId2);
        if (listenerId3 !== null) program.removeEventListener(listenerId3);
      }
    };
  }, [program, provider]);

  return events;
}
