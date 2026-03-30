"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAkari } from "@/hooks/useAkari";
import { usePool } from "@/hooks/usePool";
import { useSixPrice } from "@/hooks/useSixPrice";
import { useEpochState } from "@/hooks/useEpochState";
import { useOracleHistory } from "@/hooks/useOracleHistory";
import { useSubsidiaries } from "@/hooks/useSubsidiaries";
import { GlassCard, GlassButton, GlassInput, cn } from "@/components/ui/Glass";
import { 
  ArrowRight, 
  RefreshCw, 
  Activity, 
  ShieldCheck, 
  Zap, 
  ArrowDownUp,
  Info,
  ExternalLink
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { BN } from "@coral-xyz/anchor";
import { getPoolVaultPda, getSixPriceFeedPda } from "@/lib/constants";

export default function FxPage() {
  const searchParams = useSearchParams();
  const { program, wallet } = useAkari();
  const { poolVault } = usePool();
  const { subsidiaries } = useSubsidiaries();
  
  const [fromCurrency, setFromCurrency] = useState<0 | 1>(0); // 0=USDC, 1=EURC
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [swapResult, setSwapResult] = useState<any>(null);

  const selectedEntityPubkey = searchParams.get("entity") || (subsidiaries.length > 0 ? subsidiaries[0].publicKey.toBase58() : null);
  const selectedSub = subsidiaries.find(s => s.publicKey.toBase58() === selectedEntityPubkey);

  const eurHistory = useOracleHistory("EUR_USD");
  const chfHistory = useOracleHistory("CHF_USD");
  
  const { priceFeed: eurPrice } = useSixPrice("EUR_USD");
  const { priceFeed: chfPrice } = useSixPrice("CHF_USD");
  const { epochState: eurEpoch } = useEpochState("EUR_USD");
  const { epochState: chfEpoch } = useEpochState("CHF_USD");

  const isBuyEurc = fromCurrency === 0;
  const oraclePrice = eurPrice ? (isBuyEurc ? eurPrice.ask.toNumber() : eurPrice.bid.toNumber()) / 1_000_000 : 0;
  const expectedOut = (Number(amount) || 0) * (isBuyEurc ? (1 / oraclePrice) : oraclePrice);

  const liquiditySource = isBuyEurc 
    ? (poolVault && expectedOut * 1_000_000 < poolVault.totalEurc.toNumber() ? "Internal" : "Jupiter")
    : (poolVault && expectedOut * 1_000_000 < poolVault.totalUsdc.toNumber() ? "Internal" : "Jupiter");

  const handleSwap = async () => {
    if (!selectedSub || !amount || !program || !wallet) return;
    setIsProcessing(true);
    setSwapResult(null);
    try {
      const pda = getPoolVaultPda();
      const pair = "EUR_USD";
      const pairBytes = Array.from(Buffer.from(pair.padEnd(8, '\0')));

      const sig = await program.methods
        .fxSwap(
          fromCurrency,
          isBuyEurc ? 1 : 0,
          new BN(Number(amount) * 1_000_000),
          pairBytes,
          Buffer.from([])
        )
        .accounts({
          owner: wallet.publicKey,
          poolVault: pda,
          subsidiaryAccount: selectedSub.publicKey,
          sixPriceFeed: getSixPriceFeedPda(pair),
        })
        .rpc();

      setSwapResult({
        signature: sig,
        oracleSource: "SIX Direct",
        outAmount: expectedOut,
        liquiditySource: liquiditySource,
        timestamp: new Date().toISOString()
      });
      alert("Swap successful!");
    } catch (e: any) {
      console.error(e);
      alert("Swap failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const invertSwap = () => {
    setFromCurrency(prev => prev === 0 ? 1 : 0);
    setAmount("");
  };

  return (
    <div className="space-y-12 max-w-[1400px] mx-auto pb-24">
      
      {/* Top Section: Rates & Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <RatePanel pair="EUR_USD" history={eurHistory} epochState={eurEpoch} color="#d95000" />
         <RatePanel pair="CHF_USD" history={chfHistory} epochState={chfEpoch} color="#d357fe" />
      </div>

      {/* Bottom Section: Centered Swap Interface */}
      <div className="flex justify-center">
         <div className="w-full max-w-[520px] space-y-6">
            <GlassCard variant="strong" className="p-10 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b4044]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex justify-between items-center relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter text-[#3b4044]">Convert Assets</h3>
                  <GlassBadge className="bg-[#3b4044]/5 text-[#3b4044]/60">Interbank Mid</GlassBadge>
               </div>

               <div className="space-y-2 relative z-10">
                  <div className="p-6 bg-[#3b4044]/5 rounded-[2rem] border border-[#3b4044]/5 space-y-4">
                     <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40">From</span>
                        <div className="flex gap-2 p-0.5 bg-[#3b4044]/5 rounded-xl border border-[#3b4044]/5">
                           {[0, 1].map(c => (
                              <button 
                                 key={c}
                                 onClick={() => setFromCurrency(c as 0 | 1)}
                                 className={cn("px-4 py-1.5 text-[10px] font-black rounded-lg transition-all", fromCurrency === c ? "bg-white text-[#3b4044] shadow-sm" : "text-[#3b4044]/40")}
                              >
                                 {c === 0 ? "USDC" : "EURC"}
                              </button>
                           ))}
                        </div>
                     </div>
                     <input 
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-transparent text-4xl font-black text-[#3b4044] outline-none placeholder:text-[#3b4044]/10 tabular-nums px-1"
                     />
                  </div>

                  <div className="flex justify-center -my-6 relative z-20">
                     <button 
                        onClick={invertSwap}
                        className="p-3 bg-[#f4ecde] border border-[#3b4044]/10 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all text-[#3b4044]"
                     >
                        <ArrowDownUp size={20} />
                     </button>
                  </div>

                  <div className="p-6 bg-[#3b4044]/[0.02] rounded-[2rem] border border-[#3b4044]/5 space-y-4">
                     <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40">To (Estimated)</span>
                        <span className="text-[10px] font-black text-[#3b4044]/60 uppercase tracking-widest">{fromCurrency === 0 ? "EURC" : "USDC"}</span>
                     </div>
                     <div className="text-4xl font-black text-[#3b4044]/40 tabular-nums px-1">
                        {expectedOut ? expectedOut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "0.00"}
                     </div>
                  </div>
               </div>

               <div className="space-y-4 px-1 relative z-10">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#3b4044]/40 uppercase tracking-widest">
                     <span>Rate: 1 {fromCurrency === 0 ? "USDC" : "EURC"} = {oraclePrice.toFixed(4)} {fromCurrency === 0 ? "EURC" : "USDC"}</span>
                     <span className="text-[#3b4044]/20">(SIX Ask)</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#3b4044]/40 uppercase tracking-widest">
                     <span>Spread cost: ~$0.37</span>
                     <div className="flex items-center gap-1.5">
                        Source: {liquiditySource} Pool
                        <div className={cn("w-1.5 h-1.5 rounded-full", liquiditySource === "Internal" ? "bg-emerald-500" : "bg-amber-500")} />
                     </div>
                  </div>
               </div>

               <GlassButton 
                  variant="accent" 
                  onClick={handleSwap}
                  disabled={isProcessing || !amount}
                  className="w-full py-6 text-lg font-black tracking-tight relative z-10"
               >
                  {isProcessing ? "Executing Swap..." : "Execute Swap"}
               </GlassButton>

               {/* Result Panel */}
               <AnimatePresence>
                  {swapResult && (
                    <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 space-y-4 relative z-10"
                    >
                       <div className="flex items-center gap-2 text-emerald-600 font-black text-xs">
                          <ShieldCheck size={16} />
                          Swap Confirmed
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <span className="text-[9px] font-black uppercase tracking-widest text-[#3b4044]/40">Received</span>
                             <div className="text-sm font-black text-[#3b4044]">{swapResult.outAmount.toFixed(4)} {fromCurrency === 0 ? "EURC" : "USDC"}</div>
                          </div>
                          <div className="space-y-1">
                             <span className="text-[9px] font-black uppercase tracking-widest text-[#3b4044]/40">Source</span>
                             <div className="text-sm font-black text-[#3b4044]">{swapResult.liquiditySource}</div>
                          </div>
                       </div>
                       <button className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-600 transition-all flex items-center justify-center gap-2">
                          View in Explorer
                          <ExternalLink size={12} />
                       </button>
                    </motion.div>
                  )}
               </AnimatePresence>
            </GlassCard>
            
            <p className="text-center text-[10px] font-bold text-[#3b4044]/30 uppercase tracking-[0.2em] leading-relaxed px-8">
              All swaps are settled natively within the treasury pool avoiding exchange fees and public market impact.
            </p>
         </div>
      </div>
    </div>
  );
}

function RatePanel({ pair, history, epochState, color }: any) {
  const { priceFeed } = useSixPrice(pair);
  const mid = priceFeed ? (priceFeed.mid.toNumber() / 1_000_000).toFixed(4) : "---";
  const bid = priceFeed ? (priceFeed.bid.toNumber() / 1_000_000).toFixed(4) : "---";
  const ask = priceFeed ? (priceFeed.ask.toNumber() / 1_000_000).toFixed(4) : "---";

  const slippageMax = epochState ? epochState.maxEpochSlippageBps : 100;
  const slippageUsed = epochState ? epochState.epochAccumulatedSlippage.toNumber() : 0;
  const slippagePct = Math.min(100, (slippageUsed / slippageMax) * 100) || 0;

  return (
    <GlassCard variant="strong" className="p-10 space-y-8">
       <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <h3 className="text-3xl font-black tracking-tighter text-[#3b4044]">{pair.replace('_', '/')}</h3>
             <GlassBadge className="bg-[#3b4044]/5 text-[#3b4044]/60">SIX Feed LIVE</GlassBadge>
          </div>
          <span className="text-[10px] font-black text-[#3b4044]/40 uppercase tracking-[0.2em]">Spread: 3.2 bps</span>
       </div>

       <div className="flex items-center gap-8 py-2 bg-[#3b4044]/[0.02] border border-[#3b4044]/5 rounded-3xl px-8">
          <div className="flex flex-col gap-1">
             <span className="text-[9px] font-black text-[#3b4044]/30 uppercase tracking-widest">Bid</span>
             <span className="text-lg font-black text-red-500/60 tabular-nums">{bid}</span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[9px] font-black text-[#3b4044]/30 uppercase tracking-widest">Mid</span>
             <span className="text-2xl font-black text-[#3b4044] tabular-nums">{mid}</span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[9px] font-black text-[#3b4044]/30 uppercase tracking-widest">Ask</span>
             <span className="text-lg font-black text-emerald-500/60 tabular-nums">{ask}</span>
          </div>
       </div>

       <div className="h-[120px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={history}>
                <XAxis dataKey="timestamp" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#3b4044] text-white p-3 rounded-xl text-[10px] font-black border border-white/10 shadow-2xl">
                          {payload[0].value}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                   type="monotone" 
                   dataKey="price" 
                   stroke={color} 
                   strokeWidth={3}
                   fillOpacity={0.1}
                   fill={color}
                   isAnimationActive={false}
                />
             </AreaChart>
          </ResponsiveContainer>
       </div>

       <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
             <span className="text-[#3b4044]/40">Epoch Budget Usage: <span className="text-[#3b4044]">{slippagePct.toFixed(1)}%</span></span>
             <span className="text-[#3b4044]/40 italic">Resets in 18h 42m</span>
          </div>
          <div className="h-1.5 w-full bg-[#3b4044]/5 rounded-full overflow-hidden">
             <div 
               className={cn("h-full transition-all duration-1000", slippagePct > 80 ? "bg-red-500" : slippagePct > 50 ? "bg-amber-500" : "bg-emerald-500")}
               style={{ width: `${slippagePct}%` }}
             />
          </div>
       </div>
    </GlassCard>
  );
}

function GlassBadge({ children, className }: any) {
    return <div className={cn("px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase border", className)}>{children}</div>;
}
