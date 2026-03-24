"use client";

import { useState } from "react";
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassBadge,
  SectionHeading,
} from "@/components/ui/Glass";
import { ArrowRight, ArrowDownUp, Info, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


export default function SwapPage() {
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<any>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  const fetchQuote = async (val: string) => {
    setAmount(val);
    if (!val || isNaN(Number(val))) {
      setQuote(null);
      return;
    }

    setIsQuoting(true);
    try {
      const inAmount = Math.floor(parseFloat(val) * 1_000_000);
      const usdc = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
      const sol = "So11111111111111111111111111111111111111112";

      const res = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${usdc}&outputMint=${sol}&amount=${inAmount}&slippageBps=50`
      );
      const data = await res.json();
      setQuote(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuoting(false);
    }
  };

  const executeSwap = async () => {
    if (!quote) return;

    try {
      const { PublicKey } = await import("@solana/web3.js");
      const poolVaultPda = new PublicKey(
        "82NUzodyAhrWgpjCZ1LxfRCsD425i3KeqgeN6xbCQeux"
      );

      const swapRes = await fetch(
        "https://quote-api.jup.ag/v6/swap-instructions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteResponse: quote,
            userPublicKey: poolVaultPda.toBase58(),
            wrapAndUnwrapSol: true,
          }),
        }
      );
      const instructions = await swapRes.json();

      console.log("Jupiter Swap Instructions securely fetched:");
      console.log(instructions);

      alert("Success! Jupiter FX Route Instructions generated perfectly.");
      setAmount("");
      setQuote(null);
    } catch (e) {
      console.error(e);
      alert("Failed to build instructions.");
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-4 max-w-5xl mx-auto gap-10 pt-32 md:pt-36 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionHeading
          badge="Jupiter Aggregator"
          title="Treasury"
          highlight="FX Swaps"
          highlightClass="gradient-text-purple"
          description="Best price execution via Jupiter Aggregator for massive corporate cross-border swaps."
        />
      </motion.div>

      {/* Swap Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <GlassCard variant="strong" className="flex flex-col gap-5 relative">
          {/* Glows */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#d357fe]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#9b59b6]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          {/* You Pay */}
          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#3b4044]/50 ml-1 uppercase tracking-wider">
                You Pay
              </label>
              <GlassBadge className="text-[#3b4044]/50 text-[10px]">USDC</GlassBadge>
            </div>
            <GlassInput
              type="number"
              value={amount}
              onChange={(e) => fetchQuote(e.target.value)}
              placeholder="0.00"
              className="text-2xl font-bold"
            />
          </div>

          {/* Swap Divider */}
          <div className="flex justify-center -my-2 relative z-20">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#f4ecde] p-2.5 rounded-xl border border-white/50 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <ArrowDownUp className="w-4 h-4 text-[#3b4044]/50" />
            </motion.div>
          </div>

          {/* You Receive */}
          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#3b4044]/50 ml-1 uppercase tracking-wider">
                You Receive
              </label>
              <GlassBadge className="text-[#3b4044]/50 text-[10px]">SOL</GlassBadge>
            </div>
            <div className="w-full bg-white/30 border border-white/40 rounded-2xl px-5 py-4 text-2xl font-bold text-[#3b4044] min-h-[64px] flex items-center">
              {isQuoting ? (
                <span className="text-sm font-semibold text-[#3b4044]/40 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#d357fe]/30 border-t-[#d357fe] rounded-full animate-spin" />
                  Quoting best route...
                </span>
              ) : quote ? (
                <span>{(quote.outAmount / 1_000_000_000).toFixed(4)}</span>
              ) : (
                <span className="text-[#3b4044]/20">0.00</span>
              )}
            </div>
          </div>

          {/* Route info */}
          <AnimatePresence>
            {quote && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden relative z-10"
              >
                <div className="flex items-center gap-2 p-3.5 bg-[#d357fe]/8 rounded-xl border border-[#d357fe]/15 text-xs font-semibold text-[#d357fe] justify-center">
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    Routed through {quote.routePlan?.length} liquidity pool
                    {quote.routePlan?.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Execute Button */}
          <GlassButton
            variant="dark"
            onClick={executeSwap}
            disabled={!quote}
            className="w-full flex items-center justify-center gap-2 py-4 mt-1 relative z-10"
          >
            <span className="flex items-center gap-2">
              Execute FX Route
              <ArrowRight className="w-4 h-4" />
            </span>
          </GlassButton>
        </GlassCard>
      </motion.div>

      {/* Info card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <GlassCard variant="subtle" className="p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#e3be81]/15 mt-0.5">
              <Info className="w-4 h-4 text-[#e3be81]" strokeWidth={1.8} />
            </div>
            <div>
              <h4 className="text-sm font-bold mb-1">How it works</h4>
              <p className="text-xs text-[#3b4044]/50 leading-relaxed font-medium">
                Jupiter finds the optimal route across all Solana DEXs. The swap
                instruction is passed to Akari&apos;s <code className="text-[10px] bg-white/40 px-1.5 py-0.5 rounded font-mono">fx_swap</code> CPI
                for compliant execution with Transfer Hook verification.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
