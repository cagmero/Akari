"use client";

import { usePathname } from "next/navigation";
import { usePool } from "@/hooks/usePool";
import { useSixPrice } from "@/hooks/useSixPrice";
import { useOracleRelayStatus } from "@/hooks/useOracleRelayStatus";
import { cn } from "@/components/ui/Glass";
import { Activity, ShieldCheck, Zap, Info } from "lucide-react";
import { useState, useEffect } from "react";

export function TopBar() {
  const pathname = usePathname();
  const { poolVault } = usePool();
  const { priceFeed: sixPrice } = useSixPrice("EUR_USD");
  const { oracleRelayLock } = useOracleRelayStatus();
  const [showOracleInfo, setShowOracleInfo] = useState(false);
  const [ttl, setTtl] = useState(0);

  // Dynamic Page Title
  const getPageTitle = () => {
    switch (pathname) {
      case "/app": return "Overview";
      case "/app/pool": return "Pool Management";
      case "/app/fx": return "FX Markets";
      case "/app/yield": return "Yield Dashboard";
      case "/app/audit": return "Audit Trail";
      default: return "Dashboard";
    }
  };

  // TTL Countdown
  useEffect(() => {
    if (oracleRelayLock) {
      const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = Math.max(0, oracleRelayLock.acquiredAt.toNumber() + 60 - now);
        setTtl(remaining);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [oracleRelayLock]);

  // Oracle Status Logic
  const getOracleStatus = () => {
    if (!sixPrice) return { label: "Stale", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
    const now = Math.floor(Date.now() / 1000);
    const age = now - sixPrice.submittedAt.toNumber();
    
    if (age < 90) return { label: "SIX Live", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    return { label: "Pyth Fallback", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  };

  const oracleStatus = getOracleStatus();

  return (
    <header className="h-[80px] w-full border-b border-[#3b4044]/10 bg-white/20 backdrop-blur-md flex items-center justify-between px-10 relative z-40">
      {/* Left: Title */}
      <h1 className="text-2xl font-black tracking-tighter text-[#3b4044]">
        {getPageTitle()}
      </h1>

      {/* Center: Pool Status */}
      <div className="flex items-center gap-2 px-6 py-2 rounded-2xl bg-white/40 border border-[#3b4044]/5 shadow-sm">
        <div className={cn("w-2 h-2 rounded-full", poolVault?.paused ? "bg-red-500" : "bg-emerald-500 animate-pulse")} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3b4044]">
          {poolVault?.paused ? "Pool Paused" : "Pool Active"}
        </span>
      </div>

      {/* Right: Oracle Status */}
      <div 
        className="relative"
        onMouseEnter={() => setShowOracleInfo(true)}
        onMouseLeave={() => setShowOracleInfo(false)}
      >
        <div className={cn(
          "flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 cursor-pointer",
          oracleStatus.bg, oracleStatus.border
        )}>
           <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", oracleStatus.color)}>
              {oracleStatus.label}
           </span>
           <div className={cn("w-1.5 h-1.5 rounded-full", oracleStatus.color.replace('text', 'bg'))} />
        </div>

        {/* Oracle Info Popover */}
        {showOracleInfo && (
          <div className="absolute top-full right-0 mt-3 w-64 liquid-glass-strong p-6 rounded-[2rem] shadow-3xl border border-[#3b4044]/10 fade-in">
             <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#3b4044]/40">Relay Lock Holder</span>
                  <span className="text-[10px] font-mono font-bold text-[#3b4044] bg-[#3b4044]/5 p-2 rounded-lg truncate">
                    {oracleRelayLock?.holder.toBase58() || "None"}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-[#3b4044]/5">
                   <span className="text-[9px] font-black uppercase tracking-widest text-[#3b4044]/40">TTL Remaining</span>
                   <span className={cn(
                     "text-sm font-black tabular-nums",
                     ttl < 15 ? "text-red-500" : ttl < 30 ? "text-amber-500" : "text-emerald-500"
                   )}>
                     {ttl}s
                   </span>
                </div>
             </div>
          </div>
        )}
      </div>
    </header>
  );
}
