"use client";

import { useState } from "react";
import { useAkari } from "@/hooks/useAkari";
import { usePool } from "@/hooks/usePool";
import { useSubsidiaries } from "@/hooks/useSubsidiaries";
import { useOracleRelayStatus } from "@/hooks/useOracleRelayStatus";
import { GlassCard, GlassButton, GlassInput, cn } from "@/components/ui/Glass";
import { 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Activity, 
  Lock, 
  Unlock, 
  Key, 
  Cpu, 
  Search,
  MoreVertical,
  Flag,
  CheckCircle,
  XCircle,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PublicKey } from "@solana/web3.js";
import { getPoolVaultPda, getSubsidiaryPda } from "@/lib/constants";

export default function AdminPage() {
  const { program, wallet } = useAkari();
  const { poolVault, mutate: mutatePool } = usePool();
  const { subsidiaries, mutate: mutateSubs } = useSubsidiaries();
  const { oracleRelayLock } = useOracleRelayStatus();

  const [registerForm, setRegisterForm] = useState({ wallet: "", name: "", jurisdiction: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("Subsidiaries");

  const isAdmin = poolVault && wallet && poolVault.authority.toBase58() === wallet.publicKey.toBase58();

  const handleRegister = async () => {
    if (!registerForm.wallet || !program || !wallet) return;
    setIsProcessing(true);
    try {
      const pubkey = new PublicKey(registerForm.wallet);
      await program.methods
        .registerSubsidiary(
          Array.from(new Uint8Array(32)), 
          Array.from(new Uint8Array(32)), 
          Array.from(new Uint8Array(16))
        )
        .accounts({
          authority: wallet.publicKey,
          owner: pubkey,
          poolVault: getPoolVaultPda(),
        })
        .rpc();
      
      alert(`Subsidiary ${registerForm.name} registered.`);
      setRegisterForm({ wallet: "", name: "", jurisdiction: "" });
      mutateSubs();
    } catch (e: any) {
      console.error(e);
      alert("Registration failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleFlag = async (sub: any) => {
    if (!program || !wallet) return;
    setIsProcessing(true);
    try {
      await program.methods
        .flagWallet(!sub.account.flagged)
        .accounts({
          authority: wallet.publicKey,
          subsidiaryAccount: sub.publicKey,
          poolVault: getPoolVaultPda(),
        })
        .rpc();
      mutateSubs();
    } catch (e: any) {
       console.error(e);
    } finally {
       setIsProcessing(false);
    }
  };

  const decodeString = (arr: number[]) => new TextDecoder().decode(Uint8Array.from(arr)).replace(/\0/g, '');

  if (!wallet) return (
     <div className="min-h-screen bg-[#f4ecde] flex items-center justify-center p-8">
        <GlassCard className="p-10 text-center space-y-4">
           <Lock className="mx-auto text-[#3b4044]/20" size={48} />
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3b4044]/40">Restricted Area</p>
           <h2 className="text-xl font-black text-[#3b4044]">Secure Authorization Required</h2>
           <p className="text-sm font-bold text-[#3b4044]/50">Connect your root authority wallet to access protocol controls.</p>
        </GlassCard>
     </div>
  );

  if (!isAdmin && poolVault) return (
    <div className="min-h-screen bg-[#f4ecde] flex items-center justify-center p-8">
       <GlassCard className="p-10 text-center space-y-6 max-w-md border-red-500/20 bg-red-500/5">
          <ShieldAlert className="mx-auto text-red-500" size={48} />
          <div className="space-y-2">
             <h2 className="text-xl font-black text-[#3b4044]">Insufficient Privileges</h2>
             <p className="text-sm font-bold text-[#3b4044]/50 leading-relaxed">
                Wallet <span className="text-[#3b4044]">{wallet.publicKey.toBase58().slice(0, 8)}...</span> is not authorized for protocol administration.
             </p>
          </div>
          <GlassButton variant="subtle" onClick={() => window.location.href = '/'} className="w-full py-4 font-black">
             Return to Dashboard
          </GlassButton>
       </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4ecde] p-12">
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex justify-between items-end">
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-[#d95000]/10 rounded-lg text-[#d95000] border border-[#d95000]/20">
                    <ShieldCheck size={20} />
                 </div>
                 <h1 className="text-4xl font-black tracking-tighter text-[#3b4044]">Protocol Admin</h1>
              </div>
              <p className="text-sm font-bold text-[#3b4044]/40">Authority Oversight • Akari Core v1.0.4-devnet</p>
           </div>
           
           <div className="flex gap-4">
              <div className="px-6 py-3 bg-white/60 rounded-2xl border border-[#3b4044]/5 flex items-center gap-4">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-[#3b4044]/30 uppercase tracking-widest">Pool Status</span>
                    <span className={cn("text-xs font-black uppercase tracking-widest", poolVault?.paused ? "text-red-500" : "text-emerald-500")}>
                       {poolVault?.paused ? "Paused" : "Active"}
                    </span>
                 </div>
                 <div className={cn("w-2 h-2 rounded-full", poolVault?.paused ? "bg-red-500 animate-pulse" : "bg-emerald-500")} />
              </div>
           </div>
        </div>

        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* KYC Registry Stats */}
           <GlassCard className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 border border-blue-500/20">
                    <Users size={20} />
                 </div>
                 <h3 className="text-lg font-black tracking-tighter text-[#3b4044]">KYC Registry</h3>
              </div>
              <div className="flex justify-between items-end">
                 <span className="text-4xl font-black text-[#3b4044] tracking-tighter">{subsidiaries.length}</span>
                 <span className="text-[10px] font-black text-[#3b4044]/40 uppercase tracking-widest mb-1">Total Entities</span>
              </div>
              <div className="h-[1px] bg-[#3b4044]/5" />
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40">
                 <span>Whitelisted Wallets</span>
                 <span className="text-[#3b4044]">24 (Static Tree)</span>
              </div>
           </GlassCard>

           {/* Oracle Relay Monitoring */}
           <GlassCard className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-[#d357fe]/10 rounded-xl text-[#d357fe] border border-[#d357fe]/20">
                    <Key size={20} />
                 </div>
                 <h3 className="text-lg font-black tracking-tighter text-[#3b4044]">Oracle Cluster</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-[#3b4044]/30 uppercase tracking-widest">Active Leader</span>
                    <span className="text-[10px] font-mono font-bold text-[#3b4044] truncate p-2 bg-[#3b4044]/5 rounded-xl border border-[#3b4044]/5">
                       {oracleRelayLock ? oracleRelayLock.holder.toBase58() : "Initializing..."}
                    </span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40">
                    <span>Renewals: {oracleRelayLock?.renewalCount.toNumber()}</span>
                    <span>TTL: 14s</span>
                 </div>
              </div>
           </GlassCard>

           {/* Fireblocks / HSM Status */}
           <GlassCard className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 border border-emerald-500/20">
                    <Cpu size={20} />
                 </div>
                 <h3 className="text-lg font-black tracking-tighter text-[#3b4044]">Fireblocks Integration</h3>
              </div>
              <div className="flex flex-col gap-3">
                 <div className="flex justify-between items-center px-4 py-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <span className="text-[10px] font-black text-[#3b4044]/50 uppercase tracking-widest">MPC Status</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Online</span>
                 </div>
                 <div className="flex justify-between items-center px-4 py-3 bg-[#3b4044]/5 rounded-2xl">
                    <span className="text-[10px] font-black text-[#3b4044]/50 uppercase tracking-widest">Hot Wallet</span>
                    <span className="text-[10px] font-mono font-bold text-[#3b4044]">fb-akari-01</span>
                 </div>
              </div>
           </GlassCard>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
           
           {/* Subsidiaries List */}
           <GlassCard className="p-0 overflow-hidden">
              <div className="p-8 border-b border-[#3b4044]/5 flex justify-between items-center">
                 <div className="flex gap-8">
                    {["Subsidiaries", "Auditors", "Roles"].map(tab => (
                       <button 
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em] transition-all pb-2 border-b-2",
                            activeTab === tab ? "text-[#3b4044] border-[#3b4044]" : "text-[#3b4044]/30 border-transparent"
                          )}
                       >
                          {tab}
                       </button>
                    ))}
                 </div>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3b4044]/30" size={14} />
                    <input 
                       placeholder="Filter by pubkey..."
                       className="pl-9 pr-4 py-2 text-[10px] font-black bg-[#3b4044]/5 rounded-xl border border-transparent focus:border-[#3b4044]/10 focus:bg-white outline-none w-64 transition-all"
                    />
                 </div>
              </div>
              
              <div className="p-0">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[9px] uppercase tracking-widest text-[#3b4044]/30 border-b border-[#3b4044]/5">
                          <th className="py-6 px-8 font-black">Entity Name</th>
                          <th className="py-6 font-black">Authorized Wallet</th>
                          <th className="py-6 font-black">Compliance</th>
                          <th className="py-6 font-black">Registered</th>
                          <th className="py-6 font-black text-right px-8">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3b4044]/5">
                       {subsidiaries.map((sub: any) => (
                          <tr key={sub.publicKey.toBase58()} className="hover:bg-[#3b4044]/[0.02] transition-colors group">
                             <td className="py-6 px-8">
                                <span className="text-sm font-black text-[#3b4044]">{decodeString(sub.account.vaspId) || "Untitled Entity"}</span>
                             </td>
                             <td className="py-6">
                                <span className="text-[10px] font-mono font-bold text-[#3b4044]/60 bg-[#3b4044]/5 px-2 py-1 rounded-md">
                                   {sub.account.owner.toBase58().slice(0, 16)}...
                                </span>
                             </td>
                             <td className="py-6">
                                <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", sub.account.flagged ? "text-red-600 bg-red-500/10" : "text-emerald-600 bg-emerald-500/10")}>
                                   {sub.account.flagged ? (
                                      <><XCircle size={10} /> Flagged</>
                                   ) : (
                                      <><CheckCircle size={10} /> Cleared</>
                                   )}
                                </div>
                             </td>
                             <td className="py-6">
                                <span className="text-[10px] font-bold text-[#3b4044]/40 uppercase tracking-widest">Mar 28, 2024</span>
                             </td>
                             <td className="py-6 px-8 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                      onClick={() => handleToggleFlag(sub)}
                                      className={cn("p-2 rounded-lg border transition-all", sub.account.flagged ? "bg-emerald-500 text-white border-emerald-400" : "bg-red-500 text-white border-red-400")}
                                   >
                                      <Flag size={14} />
                                   </button>
                                   <button className="p-2 bg-[#3b4044]/5 text-[#3b4044]/40 hover:bg-[#3b4044]/10 rounded-lg border border-transparent">
                                      <MoreVertical size={14} />
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </GlassCard>

           {/* Sidebar: Admin Actions */}
           <div className="space-y-8">
              {/* Register Entity */}
              <GlassCard className="p-8 space-y-8">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 border border-blue-500/20">
                       <UserPlus size={20} />
                    </div>
                    <h3 className="text-xl font-black tracking-tighter text-[#3b4044]">Add Subsidiary</h3>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="space-y-1.5 px-1">
                       <label className="text-[9px] font-black text-[#3b4044]/40 uppercase tracking-widest">Entity Name</label>
                       <GlassInput 
                          placeholder="e.g. Acme Corp Germany"
                          value={registerForm.name}
                          onChange={e => setRegisterForm({...registerForm, name: e.target.value})}
                          className="bg-[#3b4044]/5 border-none"
                       />
                    </div>
                    <div className="space-y-1.5 px-1">
                       <label className="text-[9px] font-black text-[#3b4044]/40 uppercase tracking-widest">Authorized Wallet</label>
                       <GlassInput 
                          placeholder="Solana Pubkey..."
                          value={registerForm.wallet}
                          onChange={e => setRegisterForm({...registerForm, wallet: e.target.value})}
                          className="bg-[#3b4044]/5 border-none text-[10px] font-mono"
                       />
                    </div>
                    <div className="space-y-1.5 px-1">
                       <label className="text-[9px] font-black text-[#3b4044]/40 uppercase tracking-widest">Jurisdiction</label>
                       <GlassInput 
                          placeholder="e.g. DE or JP"
                          value={registerForm.jurisdiction}
                          onChange={e => setRegisterForm({...registerForm, jurisdiction: e.target.value})}
                          className="bg-[#3b4044]/5 border-none"
                       />
                    </div>
                 </div>

                 <GlassButton 
                    variant="accent" 
                    onClick={handleRegister}
                    disabled={isProcessing || !registerForm.wallet}
                    className="w-full py-5 text-base font-black flex items-center justify-center gap-3"
                 >
                    {isProcessing ? "Processing..." : "Commit Registration"}
                    <ArrowRight size={18} />
                 </GlassButton>
              </GlassCard>

              {/* Protocol Controls */}
              <GlassCard className="p-8 space-y-8 border-red-500/20 bg-red-500/[0.02]">
                 <div className="flex items-center gap-3 text-red-600">
                    <Activity size={20} />
                    <h3 className="text-xl font-black tracking-tighter">Emergency Pause</h3>
                 </div>
                 <p className="text-[10px] font-bold text-[#3b4044]/50 leading-relaxed px-1">
                    Pausing the protocol halts all deposits, swaps, and yield deployments immediately. Withdrawals remain active for entity liquidity access.
                 </p>
                 <GlassButton 
                    variant="subtle"
                    className={cn(
                       "w-full py-5 font-black text-base flex items-center justify-center gap-3 transition-all",
                       poolVault?.paused ? "bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-xl" : "bg-red-500 text-white hover:bg-red-600 border-none shadow-xl"
                    )}
                 >
                    {poolVault?.paused ? (
                       <><Unlock size={18} /> Resume Operations</>
                    ) : (
                       <><Lock size={18} /> Initiate Protocol Halt</>
                    )}
                 </GlassButton>
              </GlassCard>
           </div>
        </div>

      </div>
    </div>
  );
}
