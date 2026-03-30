"use client";

import { useState } from "react";
import { useYieldPositions } from "@/hooks/useYieldPositions";
import { useYieldHistory } from "@/hooks/useYieldHistory";
import { usePool } from "@/hooks/usePool";
import { useAkari } from "@/hooks/useAkari";
import { GlassCard, GlassButton, GlassInput, cn } from "@/components/ui/Glass";
import { 
  TrendingUp, 
  Flame, 
  RefreshCw, 
  ShieldCheck, 
  ArrowUpRight, 
  CircleDollarSign,
  ChevronDown,
  ChevronUp,
  Zap
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { BN } from "@coral-xyz/anchor";

const VENUES = [
  { id: "kamino", name: "Kamino", currency: "USDC", apy: "4.8%", color: "#3b82f6", icon: Flame, tag: "Lending Reserve" },
  { id: "solstice", name: "Solstice YieldVault", currency: "USDC", apy: "15.0%", color: "#d357fe", icon: Zap, tag: "Delta-neutral · Principal protected" },
  { id: "sol_kamino", name: "Solstice × Kamino Loop", currency: "USDC", apy: "22.4%", color: "url(#grad-loop)", icon: RefreshCw, tag: "Conservative (2× loop)" },
];

export default function YieldPage() {
  const { positions, mutate: mutatePositions } = useYieldPositions();
  const { history } = useYieldHistory();
  const { poolVault } = usePool();
  const { program, wallet } = useAkari();
  
  const [expandedVenue, setExpandedVenue] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const totalDeployed = positions.reduce((acc, p) => acc + (p.account?.depositedAmount.toNumber() || 0), 0) / 1_000_000;
  const totalEarned = positions.reduce((acc, p) => acc + (p.account?.totalYieldHarvested.toNumber() || 0), 0) / 1_000_000;
  const blendedApy = 12.4; // Weighted average mockup

  const handleDeploy = async (venue: string) => {
    if (!amount || !program || !wallet) return;
    setIsProcessing(true);
    try {
      // Logic from YieldDashboardContent (CPI building omitted for brevity in this UI-focused step)
      alert(`Deploying $${amount} to ${venue}...`);
      mutatePositions();
    } catch (e: any) {
      console.error(e);
      alert("Deployment failed: " + e.message);
    } finally {
      setIsProcessing(false);
      setAmount("");
    }
  };

  return (
    <div className="space-y-12 max-w-[1400px] mx-auto pb-24">
      
      {/* Row 1: Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <YieldStatCard label="Total Deployed" value={`$${totalDeployed.toLocaleString()}`} icon={CircleDollarSign} />
         <YieldStatCard label="Total Earned" value={`$${totalEarned.toLocaleString()}`} icon={TrendingUp} color="text-emerald-500" />
         <YieldStatCard label="Blended APY" value={`${blendedApy}%`} icon={Zap} color="text-[#d95000]" />
      </div>

      {/* Row 2: Venue Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {VENUES.map((venue) => {
            const pos = positions.find(p => p.venue.trim() === venue.id);
            const isExpanded = expandedVenue === venue.id;
            const depAmount = pos?.account ? pos.account.depositedAmount.toNumber() / 1_000_000 : 0;
            const accrued = pos?.account ? pos.account.totalYieldHarvested.toNumber() / 1_000_000 : 0;

            return (
              <GlassCard 
                 key={venue.id} 
                 className={cn(
                    "p-8 space-y-8 flex flex-col justify-between transition-all duration-500",
                    isExpanded ? "scale-[1.02] shadow-3xl bg-white/60" : "hover:bg-white/20"
                 )}
                 style={{ borderTop: `4px solid ${venue.id === 'sol_kamino' ? '#d357fe' : venue.color}` }}
              >
                 <div className="space-y-6">
                    <div className="flex justify-between items-start">
                       <div className="p-4 bg-[#3b4044]/5 rounded-2xl border border-[#3b4044]/5 text-[#3b4044]">
                          <venue.icon size={24} />
                       </div>
                       <GlassBadge className="bg-[#3b4044]/5 text-[#3b4044]/60">{venue.currency}</GlassBadge>
                    </div>
                    
                    <div className="space-y-1">
                       <h3 className="text-xl font-black tracking-tighter text-[#3b4044]">{venue.name}</h3>
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40">{venue.tag}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-6 border-y border-[#3b4044]/5">
                       <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#3b4044]/40">Deposited</span>
                          <div className="text-xl font-black text-[#3b4044] tabular-nums">${depAmount.toLocaleString()}</div>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#3b4044]/40">Current APY</span>
                          <div className="text-xl font-black text-emerald-500 tabular-nums">{venue.apy}</div>
                       </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold text-[#3b4044]/40 uppercase tracking-widest px-1">
                       <span>Accrued Yield: <span className="text-[#3b4044] tabular-nums">${accrued.toFixed(2)}</span></span>
                       <span className="italic">Last harvest: 2d ago</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex gap-2">
                       <GlassButton 
                          variant="accent" 
                          icon={ArrowUpRight}
                          onClick={() => alert("Harvesting...")}
                          className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border-none font-black text-xs"
                       >
                          Harvest
                       </GlassButton>
                       <GlassButton 
                          variant="accent"
                          onClick={() => setExpandedVenue(isExpanded ? null : venue.id)}
                          className={cn(
                            "flex-1 py-3 font-black text-xs transition-all",
                            isExpanded ? "bg-[#3b4044] text-white" : "bg-[#3b4044]/5 text-[#3b4044] hover:bg-[#3b4044]/10"
                          )}
                       >
                          {isExpanded ? "Cancel" : "Deploy More"}
                       </GlassButton>
                    </div>

                    {/* Inline Form */}
                    <AnimatePresence>
                       {isExpanded && (
                          <motion.div 
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: "auto", opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="overflow-hidden space-y-4 pt-4 border-t border-[#3b4044]/5"
                          >
                             <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#3b4044]/40 px-1">Amount to Deploy</span>
                                <GlassInput 
                                   type="number"
                                   placeholder="0.00"
                                   value={amount}
                                   onChange={(e) => setAmount(e.target.value)}
                                   className="py-4 text-xl font-black bg-[#3b4044]/5"
                                />
                             </div>
                             <GlassButton 
                                variant="dark" 
                                onClick={() => handleDeploy(venue.id)}
                                disabled={isProcessing || !amount}
                                className="w-full py-4 font-black"
                             >
                                {isProcessing ? "Routing..." : "Confirm Deployment"}
                             </GlassButton>
                          </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
              </GlassCard>
            );
         })}
      </div>

      {/* Row 3: History Chart */}
      <GlassCard className="p-10 space-y-12">
         <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3b4044]/40 flex items-center gap-2">
               <TrendingUp size={14} />
               Treasury Yield Performance
            </h3>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 text-[9px] font-black text-[#3b4044]/40 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Kamino
               </div>
               <div className="flex items-center gap-2 text-[9px] font-black text-[#3b4044]/40 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-[#d357fe]" /> Solstice
               </div>
            </div>
         </div>

         <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={history}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 900, fill: "#3b4044", opacity: 0.3 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#3b4044', opacity: 0.03 }}
                    contentStyle={{ 
                      backgroundColor: '#3b4044', 
                      borderRadius: '1rem', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                    labelStyle={{ display: 'none' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  />
                  <Bar dataKey="kamino" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="solstice" stackId="a" fill="#d357fe" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="loop" stackId="a" fill="#f59e0b" radius={[4, 4, 4, 4]} />
               </BarChart>
            </ResponsiveContainer>
            
            {(!history || history.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-[#3b4044]/20 italic">
                No yield harvested yet. Deploy idle balances above to begin earning.
              </div>
            )}
         </div>

         <svg width="0" height="0">
            <linearGradient id="grad-loop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d357fe" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
         </svg>
      </GlassCard>

    </div>
  );
}

function YieldStatCard({ label, value, icon: Icon, color }: any) {
  return (
    <GlassCard className="p-8 flex items-center gap-6 group hover:-translate-y-1 transition-all duration-300">
       <div className="p-4 bg-[#3b4044]/5 rounded-2xl border border-[#3b4044]/10 group-hover:bg-[#3b4044]/10 transition-colors">
          <Icon size={20} className={color || "text-[#3b4044]/60"} />
       </div>
       <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3b4044]/40">{label}</span>
          <span className="text-2xl font-black tracking-tighter text-[#3b4044] tabular-nums">{value}</span>
       </div>
    </GlassCard>
  );
}

function GlassBadge({ children, className }: any) {
    return <div className={cn("px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase border", className)}>{children}</div>;
}
