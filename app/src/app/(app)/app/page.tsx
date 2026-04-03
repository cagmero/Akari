"use client";

import { usePool } from "@/hooks/usePool";
import { useSubsidiaries } from "@/hooks/useSubsidiaries";
import { useEvents } from "@/hooks/useEvents";
import { useEpochState } from "@/hooks/useEpochState";
import { useSixPrice } from "@/hooks/useSixPrice";
import { useOracleHistory } from "@/hooks/useOracleHistory";
import { GlassCard, GlassBadge } from "@/components/ui/Glass";
import { 
  TrendingUp, 
  Users, 
  Database, 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight,
  Flame,
  Globe,
  CircleDollarSign,
  Zap
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/components/ui/Glass";

export default function OverviewPage() {
  const { poolVault } = usePool();
  const { subsidiaries } = useSubsidiaries();
  const events = useEvents();
  const { epochState: eurUsdEpoch } = useEpochState("EUR_USD");
  const { epochState: chfUsdEpoch } = useEpochState("CHF_USD");
  const { priceFeed: goldPrice } = useSixPrice("XAU_USD");

  const eurHistory = useOracleHistory("EUR_USD");
  const chfHistory = useOracleHistory("CHF_USD");
  
  const poolUsdc = poolVault ? poolVault.totalUsdc.toNumber() / 1_000_000 : 0;
  const poolEurc = poolVault ? poolVault.totalEurc.toNumber() / 1_000_000 : 0;
  const activeSubsScount = subsidiaries.length;
  const getSlippagePercent = (state: any) => {
    if (!state) return 0;
    const totalBudget = (state.vaultNavSnapshotUsdc.toNumber() * state.maxEpochSlippageBps) / 10_000;
    if (totalBudget === 0) return 0;
    return (state.epochAccumulatedSlippage.toNumber() / totalBudget) * 100;
  };

  const slippageMax = Math.max(
     getSlippagePercent(eurUsdEpoch),
     getSlippagePercent(chfUsdEpoch)
  );

  const decodeString = (arr: number[]) => {
    if (!arr || !Array.isArray(arr)) return '---';
    return new TextDecoder().decode(Uint8Array.from(arr)).replace(/\0/g, '');
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      
      {/* Row 1: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard label="Total Pool USDC" value={`$${poolUsdc.toLocaleString()}`} delta={2.4} icon={Database} />
         <StatCard label="Total Pool EURC" value={`€${poolEurc.toLocaleString()}`} delta={-0.8} icon={Globe} />
         <StatCard label="Active Subsidiaries" value={`${activeSubsScount} / 8`} delta={0} icon={Users} />
         <StatCard label="Epoch Slippage" value={`${slippageMax.toFixed(0)}%`} delta={12} icon={Scale} isNegativeBetter />
      </div>

      {/* Row 2: SIX Market Strips */}
      <div className="grid grid-cols-1 gap-6">
        <GlassCard variant="strong" className="p-8 flex flex-col lg:flex-row gap-12 divide-y lg:divide-y-0 lg:divide-x divide-[#3b4044]/5">
          <MarketSection label="EUR/USD" pair="EUR_USD" history={eurHistory} color="#d95000" />
          <MarketSection label="CHF/USD" pair="CHF_USD" history={chfHistory} color="#d357fe" />
          <MarketSection label="LBMA Gold" pair="XAU_USD" isGold />
        </GlassCard>
      </div>

      {/* Row 3: Positions & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
        
        {/* Entity Positions Table */}
        <GlassCard className="p-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3b4044]/40 mb-8 flex items-center gap-2">
            <Users size={14} />
            Institutional Entity Positions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-[#3b4044]/30 border-b border-[#3b4044]/5">
                  <th className="pb-4 font-black">Entity Name</th>
                  <th className="pb-4 font-black">Jurisdiction</th>
                  <th className="pb-4 font-black text-right">USDC Notional</th>
                  <th className="pb-4 font-black text-right">EURC Notional</th>
                  <th className="pb-4 font-black min-w-[150px]">Daily Limit Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3b4044]/5 font-black text-[#3b4044]">
                {subsidiaries.map((sub: any) => (
                  <tr key={sub.publicKey.toBase58()} className="group hover:bg-[#3b4044]/[0.02] cursor-pointer transition-all">
                     <td className="py-5 text-sm">
                        <Link href={`/app/pool?entity=${sub.publicKey.toBase58()}`}>
                           {decodeString(sub.account.name)}
                        </Link>
                     </td>
                     <td className="py-5 text-[10px] text-[#3b4044]/40 uppercase tracking-widest">
                       {decodeString(sub.account.jurisdiction)}
                     </td>
                     <td className="py-5 text-sm text-right tabular-nums">
                        ${(sub.account.usdcBalance.toNumber() / 1_000_000).toLocaleString()}
                     </td>
                     <td className="py-5 text-sm text-right tabular-nums text-[#3b4044]/60">
                        €{(sub.account.eurcBalance.toNumber() / 1_000_000).toLocaleString()}
                     </td>
                     <td className="py-5">
                       <div className="flex flex-col gap-2">
                          <span className="text-[10px] tabular-nums text-[#3b4044]/60">
                            ${(sub.account.dailyTransferTotal.toNumber() / 1_000_000).toLocaleString()} / $100k
                          </span>
                          <div className="h-1 w-full bg-[#3b4044]/5 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-emerald-500 rounded-full" 
                                style={{ width: `${(sub.account.dailyTransferTotal.toNumber() / 100_000_000_000) * 100}%` }}
                             />
                          </div>
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Live Activity Feed */}
        <GlassCard className="p-8 h-fit">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3b4044]/40 mb-8 flex items-center gap-2">
            <Activity size={14} />
            Live Activity Feed
          </h3>
          <div className="space-y-4">
             <AnimatePresence>
               {events.map((ev, i) => (
                 <motion.div 
                    key={ev.signature + i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-[#3b4044]/5 rounded-2xl border border-[#3b4044]/5 group hover:bg-white/40 transition-all"
                 >
                    <div className="flex items-center gap-3">
                       <div className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                          ev.type === "Deposit" ? "bg-emerald-500/10 text-emerald-600" : 
                          ev.type === "Swap" ? "bg-[#d357fe]/10 text-[#d357fe]" : "bg-[#d95000]/10 text-[#d95000]"
                       )}>
                          {ev.type}
                       </div>
                       <span className="text-xs font-black text-[#3b4044] tabular-nums">
                         ${(ev.amount.toNumber() / 1_000_000).toLocaleString()}
                       </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#3b4044]/40 italic">
                      {Math.floor((Date.now() - ev.time) / 1000)}s ago
                    </span>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}

function StatCard({ label, value, delta, icon: Icon, isNegativeBetter }: any) {
  const isPositive = delta > 0;
  const isNeutral = delta === 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const trendColor = isNeutral ? "text-[#3b4044]/40" : (isPositive === !isNegativeBetter ? "text-emerald-500" : "text-red-500");

  return (
    <GlassCard className="p-10 flex flex-col gap-8 group hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between">
         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3b4044]/40">{label}</span>
         <div className="p-3 bg-[#3b4044]/5 rounded-xl border border-[#3b4044]/10 group-hover:bg-[#3b4044]/10 transition-colors">
            <Icon size={18} className="text-[#3b4044]/60" />
         </div>
      </div>
      <div className="text-3xl font-black tracking-tighter text-[#3b4044] tabular-nums">
        {value}
      </div>
      {!isNeutral && (
         <div className={cn("inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest", trendColor)}>
            <TrendIcon size={14} />
            {isPositive ? "+" : ""}{delta}% vs Prev
         </div>
      )}
    </GlassCard>
  );
}

function MarketSection({ label, pair, history, color, isGold }: any) {
  const { priceFeed } = useSixPrice(pair || "XAU_USD");
  const value = priceFeed ? (priceFeed.mid.toNumber() / 1_000_000).toFixed(4) : "---";

  return (
    <div className="flex-1 px-4 lg:px-8 space-y-6">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <span className="text-sm font-black text-[#3b4044]">{label} / USD</span>
             <GlassBadge className="text-[9px] py-0.5 bg-[#3b4044]/5">SIX</GlassBadge>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#3b4044]/40">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             Live
          </div>
       </div>

       <div className="flex items-baseline gap-4">
          <span className="text-4xl font-black tracking-tighter text-[#3b4044] tabular-nums">
            {isGold ? `$${Number(value).toFixed(2)}` : value}
          </span>
          {!isGold && (
             <div className="flex gap-2 text-[9px] font-black text-[#3b4044]/40">
                <span className="text-red-500/50">{(Number(value) * 0.9998).toFixed(4)}</span>
                <span className="text-emerald-500/50">{(Number(value) * 1.0002).toFixed(4)}</span>
             </div>
          )}
       </div>

       {!isGold && (
         <div className="h-[60px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={history}>
                  <defs>
                    <linearGradient id={`grad-${pair}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                     type="monotone" 
                     dataKey="price" 
                     stroke={color} 
                     strokeWidth={2.5}
                     fillOpacity={1} 
                     fill={`url(#grad-${pair})`} 
                     isAnimationActive={false}
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
       )}

       <div className="flex items-center justify-between text-[10px] font-bold text-[#3b4044]/40 uppercase tracking-widest pt-2">
          <span>Spread: 3.2 bps</span>
          <span>Updated 12s ago</span>
       </div>
    </div>
  );
}

function Activity({ size, className }: any) {
    return <Zap size={size} className={className} />;
}
