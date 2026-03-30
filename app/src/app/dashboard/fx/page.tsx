"use client";

import { useState } from "react";
import { GlassCard, GlassButton, GlassInput, SectionHeading, cn } from "@/components/ui/Glass";
import { ArrowDownUp, RefreshCcw, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAkari } from "@/hooks/useAkari";
import { useEpochState } from "@/hooks/useEpochState";
import { useSixPrice } from "@/hooks/useSixPrice";
import { useOracleRelayStatus } from "@/hooks/useOracleRelayStatus";
import { useSubsidiary } from "@/hooks/useSubsidiary";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getPoolVaultPda, getEpochStatePda, getSixPriceFeedPda } from "@/lib/constants";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

export default function FxDashboard() {
  const { program, wallet } = useAkari();
  
  // Hardcoded for MVP to EUR_USD
  const CURRENCY_PAIR = "EUR_USDP"; 
  const { epochState } = useEpochState(CURRENCY_PAIR);
  const { priceFeed } = useSixPrice(CURRENCY_PAIR);
  const { oracleRelayLock } = useOracleRelayStatus();
  const { subsidiaryPda } = useSubsidiary();

  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"USDC_EURC" | "EURC_USDC">("USDC_EURC");
  const [isProcessing, setIsProcessing] = useState(false);

  const parsedAmount = Number(amount) || 0;
  
  // Calculate Notional Prices
  let exchangeRate = 0;
  let spread = 0;
  if (priceFeed && priceFeed.mid) {
    const mid = Number(priceFeed.mid) / 1_000_000;
    const ask = Number(priceFeed.ask) / 1_000_000;
    const bid = Number(priceFeed.bid) / 1_000_000;
    spread = Number(priceFeed.spreadBps);

    if (direction === "USDC_EURC") {
      exchangeRate = 1 / ask; // Buy EURC with USDC
    } else {
      exchangeRate = bid; // Sell EURC for USDC
    }
  }

  const expectedOutput = parsedAmount > 0 && exchangeRate > 0 ? parsedAmount * exchangeRate : 0;
  
  const handleSwap = async () => {
    if (!amount || parsedAmount <= 0 || !program || !wallet) {
      return alert("Connect wallet and enter amount");
    }
    
    setIsProcessing(true);
    try {
      const isUsdcToEurc = direction === "USDC_EURC";
      
      const epochStatePda = getEpochStatePda(CURRENCY_PAIR);
      const sixPriceFeedPda = getSixPriceFeedPda(CURRENCY_PAIR);
      const poolVaultPda = getPoolVaultPda();
      
      // Because we aren't mocking the klend/Jup CPI strictly here, we just throw raw buffer (0 length for internal only test)
      // The router in our contract natively attempts Jupiter if pool lacks balance, which reverts without Jup accounts.
      
      const currencyPairBytes = Array.from(Buffer.from(CURRENCY_PAIR.padEnd(8, '\0')));
      
      const sig = await program.methods
        .fxSwap(
          isUsdcToEurc ? 0 : 1, // from
          isUsdcToEurc ? 1 : 0, // to
          new BN(parsedAmount * 1_000_000), 
          currencyPairBytes,
          Buffer.from([]) // ixData empty
        )
        .accounts({
            owner: wallet.publicKey,
            poolVault: getPoolVaultPda(),
            subsidiaryAccount: subsidiaryPda as PublicKey,
            sixPriceFeed: getSixPriceFeedPda(CURRENCY_PAIR),
            // epochState is resolved via resolution
        })
        .rpc();

      alert("Swap Confirmed! Tx: " + sig);
      setAmount("");
    } catch (e: any) {
      console.error(e);
      alert("Swap failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getOracleStatusColor = () => {
    if (!oracleRelayLock) return "bg-zinc-500";
    const now = Math.floor(Date.now() / 1000);
    const age = now - oracleRelayLock.acquiredAt.toNumber();
    if (age > 60) return "bg-red-500 animate-pulse"; // Dead
    if (age > 45) return "bg-[#d95000]"; // Stale
    return "bg-emerald-500"; // Fresh
  };

  const slippageMax = epochState ? epochState.maxEpochSlippageBps : 100;
  const slippageUsed = epochState ? epochState.epochAccumulatedSlippage.toNumber() : 0;
  const slippagePct = Math.min(100, (slippageUsed / slippageMax) * 100) || 0;

  return (
    <div className="flex flex-col items-center w-full px-4 pt-44 md:pt-48 pb-32">
      <div className="container-wide flex flex-col items-center gap-16">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <SectionHeading
            title="FX"
            highlight="Execution"
            description="Institutional zero-fee swaps settled natively inside the treasury using resilient direct feeds."
          />
        </motion.div>

        <div className="w-full max-w-4xl grid md:grid-cols-[1fr_400px] gap-8">
          
          {/* Swap Panel */}
          <GlassCard variant="strong" className="p-8 relative flex flex-col gap-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex justify-between items-center relative z-10">
              <h3 className="font-black text-2xl tracking-tighter text-[#3b4044]">Trade</h3>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 border border-[#3b4044]/10">
                <div className={cn("w-2 h-2 rounded-full", getOracleStatusColor())} />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#3b4044]/60">Feed Status</span>
              </div>
            </div>

            <div className="flex flex-col relative z-10">
              {/* You Pay */}
              <div className="p-6 bg-white/30 border border-[#3b4044]/10 rounded-3xl flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-[#3b4044]/40 uppercase tracking-widest">You Pay</label>
                  <span className="text-xs font-bold text-[#3b4044]">{direction === "USDC_EURC" ? "USDC" : "EURC"}</span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-4xl font-black text-[#3b4044] w-full outline-none placeholder:text-[#3b4044]/20"
                />
              </div>

              {/* Invert */}
              <div className="flex justify-center -my-4 relative z-20">
                <button 
                  onClick={() => setDirection(d => d === "USDC_EURC" ? "EURC_USDC" : "USDC_EURC")}
                  className="p-3 bg-[#f4ecde] border border-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all text-[#3b4044]"
                >
                  <ArrowDownUp className="w-5 h-5" />
                </button>
              </div>

              {/* You Receive */}
              <div className="p-6 bg-[#3b4044]/5 border border-[#3b4044]/15 rounded-3xl flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-[#3b4044]/40 uppercase tracking-widest">You Receive</label>
                  <span className="text-xs font-bold text-[#3b4044]/80">{direction === "USDC_EURC" ? "EURC" : "USDC"}</span>
                </div>
                <div className="text-4xl font-black text-[#3b4044]">
                  {expectedOutput.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </div>
              </div>
            </div>

            <GlassButton
              variant="dark"
              onClick={handleSwap}
              disabled={isProcessing || !amount || Number(amount) <= 0}
              className="w-full py-5 text-lg shadow-xl"
            >
              {isProcessing ? "Processing Swap..." : "Execute Zero-Fee Swap"}
            </GlassButton>
            
            {spread > 0 && (
               <div className="text-center text-[10px] font-black tracking-widest uppercase text-emerald-600">
                  Spread Locked: {spread} BPS (Native Interbank)
               </div>
            )}
          </GlassCard>

          {/* Right Col: Metrics */}
          <div className="flex flex-col gap-6">
            
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black uppercase tracking-widest text-[#3b4044]/60">Epoch Slippage</h3>
              </div>
              
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-black tracking-tighter text-[#3b4044]">{slippagePct.toFixed(1)}%</span>
                <span className="text-[10px] font-black tracking-[0.2em] text-[#3b4044]/40 mb-1 uppercase">Allocated</span>
              </div>
              
              <div className="w-full h-2 bg-[#3b4044]/10 rounded-full overflow-hidden">
                <motion.div 
                  className={cn("h-full rounded-full", slippagePct > 80 ? "bg-red-500" : "bg-emerald-500")}
                  initial={{ width: 0 }}
                  animate={{ width: `${slippagePct}%` }}
                />
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-[#d95000]" />
                <h3 className="text-xs font-black uppercase tracking-widest text-[#3b4044]/60">SIX Rate Status</h3>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center bg-white/40 px-4 py-2 rounded-xl">
                  <span className="text-xs font-bold text-[#3b4044]/60">Mid</span>
                  <span className="font-black text-[#3b4044]">{priceFeed ? (priceFeed.mid.toNumber() / 1_000_000).toFixed(5) : "---"}</span>
                </div>
                <div className="flex justify-between items-center bg-white/40 px-4 py-2 rounded-xl">
                  <span className="text-xs font-bold text-[#3b4044]/60">Bid</span>
                  <span className="font-black text-[#3b4044]">{priceFeed ? (priceFeed.bid.toNumber() / 1_000_000).toFixed(5) : "---"}</span>
                </div>
                <div className="flex justify-between items-center bg-white/40 px-4 py-2 rounded-xl">
                  <span className="text-xs font-bold text-[#3b4044]/60">Ask</span>
                  <span className="font-black text-[#3b4044]">{priceFeed ? (priceFeed.ask.toNumber() / 1_000_000).toFixed(5) : "---"}</span>
                </div>
              </div>
            </GlassCard>

          </div>
        </div>

      </div>
    </div>
  );
}
