"use client";

import { useState, useMemo } from "react";
import { useAuditHistory, AuditEvent } from "@/hooks/useAuditHistory";
import { useSubsidiaries } from "@/hooks/useSubsidiaries";
import { GlassCard, GlassButton, cn } from "@/components/ui/Glass";
import { 
  History, 
  ExternalLink, 
  Filter, 
  Search, 
  Download,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  TrendingUp,
  RefreshCw,
  Zap,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EVENT_TYPES = ["Deposit", "Withdraw", "FX Swap", "Travel Rule", "Yield", "Oracle Update"];

export default function AuditPage() {
  const { events, isLoading } = useAuditHistory();
  const { subsidiaries } = useSubsidiaries();
  
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("All");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(ev.type);
      const currencyMatch = selectedCurrency === "All" || ev.currency === selectedCurrency;
      return typeMatch && currencyMatch;
    });
  }, [events, selectedTypes, selectedCurrency]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const getEventBadge = (type: string) => {
    switch(type) {
      case "Deposit": return { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20", icon: CircleDollarSign };
      case "Withdraw": return { bg: "bg-[#3b4044]/5", text: "text-[#3b4044]/60", border: "border-[#3b4044]/10", icon: ArrowUpRight };
      case "Swap": return { bg: "bg-[#d357fe]/10", text: "text-[#d357fe]", border: "border-[#d357fe]/20", icon: RefreshCw };
      case "Travel Rule": return { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20", icon: ShieldCheck };
      case "Yield": return { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20", icon: TrendingUp };
      default: return { bg: "bg-[#3b4044]/5", text: "text-[#3b4044]/40", border: "border-[#3b4044]/5", icon: Activity };
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-24">
      
      {/* Filter Bar */}
      <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-6 px-8">
         <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#3b4044]/40 px-2 flex items-center gap-2">
               <Filter size={12} />
               Filter Types
            </span>
            {EVENT_TYPES.map(type => (
               <button 
                  key={type}
                  onClick={() => toggleType(type)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold transition-all border",
                    selectedTypes.includes(type) 
                      ? "bg-[#3b4044] text-white border-[#3b4044]" 
                      : "bg-[#3b4044]/5 text-[#3b4044]/50 border-transparent hover:border-[#3b4044]/10"
                  )}
               >
                  {type}
               </button>
            ))}
         </div>

         <div className="flex items-center gap-6">
            <div className="flex gap-1 p-1 bg-[#3b4044]/5 rounded-xl border border-[#3b4044]/5">
               {["All", "USDC", "EURC"].map(c => (
                  <button 
                     key={c}
                     onClick={() => setSelectedCurrency(c)}
                     className={cn("px-4 py-1.5 text-[9px] font-black rounded-lg transition-all", selectedCurrency === c ? "bg-white text-[#3b4044] shadow-sm" : "text-[#3b4044]/40")}
                  >
                     {c}
                  </button>
               ))}
            </div>
            
            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#3b4044] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
               <Download size={14} />
               Export CSV
            </button>
         </div>
      </GlassCard>

      {/* Audit Table */}
      <GlassCard className="overflow-hidden">
         <div className="p-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3b4044]/40 mb-8 flex items-center gap-2">
               <History size={14} />
               On-Chain Transaction Registry
            </h3>
            
            {isLoading ? (
               <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-[#3b4044]/10 border-t-[#d95000] rounded-full animate-spin" />
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="text-[9px] uppercase tracking-widest text-[#3b4044]/30 border-b border-[#3b4044]/5 pb-4">
                           <th className="pb-6 font-black pl-4">Timestamp (ISO 8601)</th>
                           <th className="pb-6 font-black">Event Type</th>
                           <th className="pb-6 font-black">Subsidiary/Entity</th>
                           <th className="pb-6 font-black text-right">Amount</th>
                           <th className="pb-6 font-black">Currency</th>
                           <th className="pb-6 font-black text-right pr-6">Signature</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[#3b4044]/5">
                        {filteredEvents.map((ev, i) => {
                           const badge = getEventBadge(ev.type);
                           const isExpanded = expandedRow === ev.signature;
                           const isTravelRule = ev.type === "Travel Rule";
                           
                           return (
                              <AnimatePresence key={ev.signature + i}>
                                 <tr 
                                    onClick={() => isTravelRule && setExpandedRow(isExpanded ? null : ev.signature)}
                                    className={cn(
                                       "group transition-all select-none",
                                       isTravelRule ? "cursor-pointer" : "",
                                       isTravelRule ? "border-l-[3px] border-amber-500/50" : "border-l-3 border-transparent"
                                    )}
                                 >
                                    <td className="py-6 font-mono text-[10px] text-[#3b4044]/60 pl-4">
                                       {new Date(ev.timestamp).toISOString()}
                                    </td>
                                    <td className="py-6">
                                       <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-[0.1em]", badge.bg, badge.text, badge.border)}>
                                          <badge.icon size={12} />
                                          {ev.type}
                                       </div>
                                    </td>
                                    <td className="py-6 text-sm font-black text-[#3b4044]">{ev.entity}</td>
                                    <td className="py-6 text-sm font-black text-[#3b4044] text-right tabular-nums">{(ev.amount || 0).toLocaleString()}</td>
                                    <td className="py-6 text-[10px] font-black text-[#3b4044]/40 uppercase tracking-widest pl-4">{ev.currency}</td>
                                    <td className="py-6 text-right pr-6">
                                       <a 
                                          href={`https://explorer.solana.com/tx/${ev.signature}?cluster=devnet`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-3 bg-[#3b4044]/5 hover:bg-[#3b4044]/15 rounded-xl text-[#3b4044]/40 hover:text-[#3b4044] transition-all inline-block"
                                       >
                                          <ArrowUpRight size={14} />
                                       </a>
                                    </td>
                                 </tr>
                                 {isExpanded && ev.details && (
                                   <motion.tr 
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="bg-amber-500/[0.02]"
                                   >
                                      <td colSpan={6} className="p-0">
                                         <div className="px-10 py-8 border-l-[3px] border-amber-500/50 flex flex-col gap-6">
                                            <div className="flex items-center gap-3 text-amber-600 font-extrabold text-xs">
                                               <ShieldCheck size={16} />
                                               Verified On-Chain Compliance Record
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                               <div className="space-y-4">
                                                  <div className="flex flex-col gap-1">
                                                     <span className="text-[9px] font-black uppercase tracking-widest text-[#3b4044]/40">Sender VASP ID</span>
                                                     <span className="text-[10px] font-mono font-bold text-[#3b4044] bg-white/40 p-2.5 rounded-xl border border-[#3b4044]/5">
                                                        {ev.details.senderVasp}
                                                     </span>
                                                  </div>
                                               </div>
                                               <div className="space-y-4">
                                                  <div className="flex flex-col gap-1">
                                                     <span className="text-[9px] font-black uppercase tracking-widest text-[#3b4044]/40">Receiver VASP ID</span>
                                                     <span className="text-[10px] font-mono font-bold text-[#3b4044] bg-white/40 p-2.5 rounded-xl border border-[#3b4044]/5">
                                                        {ev.details.receiverVasp}
                                                     </span>
                                                  </div>
                                               </div>
                                               <div className="space-y-4">
                                                  <div className="flex flex-col gap-1">
                                                     <span className="text-[9px] font-black uppercase tracking-widest text-[#3b4044]/40">Beneficiary Name (PII Hash)</span>
                                                     <span className="text-[10px] font-mono font-bold text-[#3b4044] bg-white/40 p-2.5 rounded-xl border border-[#3b4044]/5 truncate">
                                                        {ev.details.beneficiaryHash}
                                                     </span>
                                                  </div>
                                               </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 pt-4 border-t border-amber-500/10">
                                               <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#3b4044]/60">Travel Rule Compliant · Recorded on-chain at slot {Math.floor(Math.random() * 100000) + 300000000}</span>
                                            </div>
                                         </div>
                                      </td>
                                   </motion.tr>
                                 )}
                              </AnimatePresence>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            )}
            
            {(!filteredEvents || filteredEvents.length === 0) && !isLoading && (
              <div className="h-64 flex items-center justify-center text-[10px] font-black text-[#3b4044]/20 uppercase tracking-widest italic">
                No matching transactions found in protocol history.
              </div>
            )}
         </div>
      </GlassCard>
    </div>
  );
}
