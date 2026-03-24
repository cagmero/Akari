"use client";

import { useState } from "react";
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassBadge,
  SectionHeading,
  cn,
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
    <div className="flex flex-col items-center w-full px-4 pt-44 md:pt-60 pb-32">
      <div className="container-wide flex flex-col items-center gap-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            badge="Jupiter Aggregator"
            title="Treasury"
            highlight="FX Swaps"
            highlightClass="gradient-text-purple"
            description="Best price execution via Jupiter for institutional cross-border treasury swaps with minimal slippage."
          />
        </motion.div>

        {/* Swap Card Container */}
        <div className="w-full max-w-xl flex flex-col gap-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard variant="strong" className="flex flex-col gap-10 relative shadow-2xl p-12 md:p-16">
              {/* Dynamic Glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d357fe]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#9b59b6]/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

              {/* You Pay */}
              <div className="flex flex-col gap-3 relative z-10">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-black text-[#3b4044]/40 uppercase tracking-widest">
                    You Pay
                  </label>
                  <GlassBadge className="text-[#3b4044]/60 bg-white/40 border-white/60">USDC</GlassBadge>
                </div>
                <GlassInput
                  type="number"
                  value={amount}
                  onChange={(e) => fetchQuote(e.target.value)}
                  placeholder="0.00"
                  className="text-3xl font-black py-7"
                />
              </div>

              {/* Swap Divider */}
              <div className="flex justify-center -my-3 relative z-20">
                <motion.div
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-[#f4ecde] p-3 rounded-2xl border border-white/80 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
                >
                  <ArrowDownUp className="w-5 h-5 text-[#3b4044]/60" />
                </motion.div>
              </div>

              {/* You Receive */}
              <div className="flex flex-col gap-3 relative z-10">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-black text-[#3b4044]/40 uppercase tracking-widest">
                    You Receive
                  </label>
                  <GlassBadge className="text-[#3b4044]/60 bg-white/40 border-white/60">SOL</GlassBadge>
                </div>
                <div className="w-full bg-white/30 border border-white/50 rounded-2xl px-8 py-8 text-4xl font-black text-[#3b4044] min-h-[100px] flex items-center shadow-inner">
                  {isQuoting ? (
                    <span className="text-sm font-bold text-[#3b4044]/40 flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-[#d357fe]/30 border-t-[#d357fe] rounded-full animate-spin" />
                      Optimizing route...
                    </span>
                  ) : quote ? (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {(quote.outAmount / 1_000_000_000).toFixed(4)}
                    </motion.span>
                  ) : (
                    <span className="text-[#3b4044]/15">0.00</span>
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
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden relative z-10"
                  >
                    <div className="flex items-center gap-3 p-4 bg-[#d357fe]/8 rounded-2xl border border-[#d357fe]/15 text-[11px] font-black text-[#d357fe] justify-center uppercase tracking-widest">
                      <Zap className="w-4 h-4 fill-current" />
                      <span>
                        Optimal Route Found • {quote.routePlan?.length} Hop{quote.routePlan?.length !== 1 ? "s" : ""}
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
                className="w-full flex items-center justify-center gap-3 py-6 mt-2 relative z-10 text-lg shadow-2xl"
              >
                <span className="flex items-center gap-3">
                  Execute FX Swap
                  <ArrowRight className="w-5 h-5" />
                </span>
              </GlassButton>
            </GlassCard>
          </motion.div>

          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard variant="subtle" className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#e3be81]/20 mt-0.5 border border-[#e3be81]/20 shadow-sm">
                  <Info className="w-5 h-5 text-[#e3be81]" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-sm font-black mb-1.5 text-[#3b4044]">Infrastructure Note</h4>
                  <p className="text-xs text-[#3b4044]/50 leading-relaxed font-bold">
                    Jupiter Aggregator identifies the most capital-efficient route across all Solana liquidity. 
                    Execution is managed by Akari&apos;s <code className="text-[10px] bg-white/60 px-2 py-0.5 rounded font-mono border border-white/80">proxy_swap</code> 
                    system for full transparency.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
