"use client";

import { useState } from "react";
import { GlassCard, GlassButton, GlassInput, SectionHeading, cn } from "@/components/ui/Glass";
import { ShieldAlert, UserCheck, PauseCircle, PlayCircle, Key } from "lucide-react";
import { motion } from "framer-motion";
import { useAkari } from "@/hooks/useAkari";
import { useOracleRelayStatus } from "@/hooks/useOracleRelayStatus";
import { usePool } from "@/hooks/usePool";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getPoolVaultPda, getSubsidiaryPda } from "@/lib/constants";

export default function AdminPage() {
  const { program, wallet } = useAkari();
  const { oracleRelayLock } = useOracleRelayStatus();
  const { poolVault, mutate: mutatePool } = usePool();

  const [targetWallet, setTargetWallet] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const isAdmin = poolVault && wallet && poolVault.authority.toBase58() === wallet.publicKey.toBase58();

  const handleRegisterSubsidiary = async () => {
    if (!targetWallet || !program || !wallet) return alert("Enter valid pubkey");
    setIsProcessing(true);
    try {
      const pubkey = new PublicKey(targetWallet);
      const subPda = getSubsidiaryPda(pubkey);

      const sig = await program.methods
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
        
      alert(`Subsidiary ${pubkey.toBase58()} registered! Tx: ${sig}`);
      setTargetWallet("");
    } catch (e: any) {
      console.error(e);
      alert("Registration failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePause = async () => {
    if (!program || !wallet || !poolVault) return;
    setIsProcessing(true);
    try {
      const newState = !poolVault.paused;
      const sig = await program.methods
        .pausePool(newState)
        .accounts({
          authority: wallet.publicKey,
          poolVault: getPoolVaultPda(),
        })
        .rpc();
      alert(`Pool ${newState ? "Paused" : "Unpaused"}! Tx: ${sig}`);
      mutatePool();
    } catch (e: any) {
      console.error(e);
      alert("Failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-4 pt-44 md:pt-48 pb-32">
      <div className="container-wide flex flex-col items-center gap-16">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <SectionHeading
            title="Protocol"
            highlight="Admin Panel"
            description="Manage subsidiary KYC registration, emergency protocol pauses, and Oracle Relay monitoring."
          />
        </motion.div>

        {!wallet ? (
          <GlassCard className="p-10">Connect your wallet securely</GlassCard>
        ) : !isAdmin ? (
          <GlassCard className="p-10 flex flex-col items-center gap-4 text-center">
            <ShieldAlert className="w-10 h-10 text-red-500" />
            <h3 className="font-black text-xl text-[#3b4044]">Unauthorized Access</h3>
            <p className="text-sm font-bold text-[#3b4044]/50 max-w-sm">
              Your connected wallet ({wallet.publicKey.toBase58().slice(0, 4)}...{wallet.publicKey.toBase58().slice(-4)}) is not the designated Pool Authority.
            </p>
          </GlassCard>
        ) : (
          <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
            
            {/* Left Col: Actions */}
            <div className="flex flex-col gap-6">
              
              <GlassCard variant="strong" className="p-8">
                <div className="flex items-center gap-2 mb-6 text-[#3b4044]">
                  <UserCheck className="w-5 h-5" />
                  <h3 className="font-black text-xl tracking-tighter">Register Subsidiary</h3>
                </div>
                
                <div className="flex flex-col gap-4">
                  <GlassInput
                    value={targetWallet}
                    onChange={(e) => setTargetWallet(e.target.value)}
                    placeholder="Enter Subsidiary Public Key"
                    className="py-4"
                  />
                  <GlassButton 
                    variant="accent" 
                    onClick={handleRegisterSubsidiary}
                    disabled={isProcessing || !targetWallet}
                    className="py-4 shadow-xl"
                  >
                    Onboard via Transfer Hook
                  </GlassButton>
                </div>
              </GlassCard>

              <GlassCard className="p-8 border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-2 mb-6 text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-black text-xl tracking-tighter">Emergency Controls</h3>
                </div>
                
                <div className="flex justify-between items-center bg-white/50 px-5 py-4 rounded-xl border border-red-500/10 mb-6">
                  <span className="text-sm font-bold text-[#3b4044]">Pool Status</span>
                  <span className={cn("text-sm font-black uppercase tracking-widest", poolVault.paused ? "text-red-600" : "text-emerald-600")}>
                    {poolVault.paused ? "PAUSED" : "ACTIVE"}
                  </span>
                </div>

                <GlassButton
                  onClick={handleTogglePause}
                  disabled={isProcessing}
                  className={cn(
                    "w-full py-4 shadow-xl transition-colors",
                    poolVault.paused 
                      ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                      : "bg-red-500 text-white hover:bg-red-600 border-red-400"
                  )}
                >
                  {poolVault.paused ? (
                    <span className="flex items-center justify-center gap-2"><PlayCircle className="w-4 h-4"/> Resume Protocol</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><PauseCircle className="w-4 h-4"/> Pause Protocol</span>
                  )}
                </GlassButton>
              </GlassCard>

            </div>

            {/* Right Col: Monitoring */}
            <div className="flex flex-col gap-6">
              
              <GlassCard className="p-8 flex flex-col gap-6">
                <div className="flex items-center gap-2 text-[#3b4044]">
                  <Key className="w-5 h-5" />
                  <h3 className="font-black text-xl tracking-tighter">Oracle Relay Cluster</h3>
                </div>
                
                <div className="flex justify-between items-center bg-white/40 px-4 py-3 rounded-xl">
                  <span className="text-xs font-bold text-[#3b4044]/60">Action Count</span>
                  <span className="font-black text-[#3b4044]">{oracleRelayLock ? oracleRelayLock.renewalCount.toNumber() : 0}</span>
                </div>
                
                <div className="flex flex-col gap-2 bg-white/40 px-4 py-3 rounded-xl overflow-hidden">
                  <span className="text-xs font-bold text-[#3b4044]/60">Current Leader pubkey</span>
                  <span className="font-black text-[10px] text-[#3b4044] truncate">{oracleRelayLock ? oracleRelayLock.holder.toBase58() : "None"}</span>
                </div>

                <div className="flex justify-between items-center bg-white/40 px-4 py-3 rounded-xl">
                  <span className="text-xs font-bold text-[#3b4044]/60">Time Since Activity</span>
                  <span className="font-black text-[#3b4044]">
                    {oracleRelayLock ? Math.floor(Date.now() / 1000) - oracleRelayLock.acquiredAt.toNumber() : 0}s
                  </span>
                </div>
              </GlassCard>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
