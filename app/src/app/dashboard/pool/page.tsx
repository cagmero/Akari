"use client";

import { useState } from "react";
import { GlassCard, GlassButton, GlassInput, SectionHeading, cn } from "@/components/ui/Glass";
import { ArrowRight, Wallet, TrendingUp, Layers, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAkari } from "@/hooks/useAkari";
import { useSubsidiary } from "@/hooks/useSubsidiary";
import { usePool } from "@/hooks/usePool";
import { airdropDemoUSDC } from "@/app/actions/airdrop";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getPoolVaultPda, USDC_MINT, EURC_MINT } from "@/lib/constants";

export default function PoolDashboard() {
  const { program, wallet } = useAkari();
  const { subsidiary, subsidiaryPda, mutate: mutateSubsidiary } = useSubsidiary();
  const { poolVault, mutate: mutatePool } = usePool();

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<0 | 1>(0); // 0=USDC, 1=EURC
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const handleMintDemoUSDC = async () => {
    if (!wallet) return alert("Connect wallet first!");
    setIsMinting(true);
    try {
      const res = await airdropDemoUSDC(wallet.publicKey.toBase58());
      if (res.success) alert("Minted 1,000 Demo USDC! Tx: " + res.signature);
      else alert("Error minting: " + res.error);
    } catch (e) {
      console.error(e);
    } finally {
      setIsMinting(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || isNaN(Number(amount)) || !program || !wallet || !subsidiary) {
      return alert("Connect wallet, register subsidiary, and enter valid amount.");
    }

    setIsProcessing(true);
    try {
      const poolVaultPda = getPoolVaultPda();
      const mint = currency === 0 ? USDC_MINT : EURC_MINT;

      const userAta = getAssociatedTokenAddressSync(mint, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
      const vaultAta = getAssociatedTokenAddressSync(mint, poolVaultPda, true, TOKEN_2022_PROGRAM_ID);

      const txSignature = await program.methods
        .deposit(new BN(Number(amount) * 1_000_000), currency)
        .accounts({
          owner: wallet.publicKey,
          poolVault: poolVaultPda,
          subsidiaryAccount: subsidiaryPda as PublicKey,
          subsidiaryAta: userAta,
          poolAta: vaultAta,
          mint: mint,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .rpc();

      alert("Success! Deposit confirmed: " + txSignature);
      setAmount("");
      mutateSubsidiary();
      mutatePool();
    } catch (e: any) {
      console.error(e);
      alert(`Error depositing: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const limitPct = poolVault && subsidiary 
    ? Math.min(100, (subsidiary.dailyTransferTotal.toNumber() / poolVault.dailyLimitUsdc.toNumber()) * 100) 
    : 0;

  return (
    <div className="flex flex-col items-center w-full px-4 pt-44 md:pt-48 pb-32">
      <div className="container-wide flex flex-col items-center gap-16">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <SectionHeading
            title="Internal"
            highlight="Treasury Pool"
            description="Manage your subsidiary balances and daily compliance limits privately."
          />
        </motion.div>

        {!wallet ? (
          <GlassCard className="p-10 text-center text-[#3b4044]/60 font-bold uppercase tracking-widest text-sm">
            Connect Wallet to view subsidiary
          </GlassCard>
        ) : !subsidiary ? (
          <GlassCard className="p-10 text-center flex flex-col items-center gap-4">
            <AlertCircle className="w-10 h-10 text-[#d95000]/60" />
            <div className="text-[#3b4044] font-black text-xl">Not Registered</div>
            <div className="text-sm font-bold text-[#3b4044]/50 max-w-sm">
              Your wallet is not registered as an Akari subsidiary. Please contact the administrator to process KYC.
            </div>
          </GlassCard>
        ) : (
          <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
            
            {/* Left Col: Balances & Limits */}
            <div className="flex flex-col gap-8">
              <GlassCard variant="strong" className="p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none transition-all duration-700 group-hover:scale-150" />
                
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3b4044]/40 mb-6">Subsidiary Book Value</h3>
                
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <span className="text-4xl font-black text-[#3b4044] tracking-tighter">
                      ${(subsidiary.usdcBalance.toNumber() / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm font-bold text-[#3b4044]/50 mb-1">USDC</span>
                  </div>
                  
                  <div className="h-[1px] w-full bg-[#3b4044]/10" />
                  
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-black text-[#3b4044]/80 tracking-tighter">
                      €{(subsidiary.eurcBalance.toNumber() / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm font-bold text-[#3b4044]/40 mb-1">EURC</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3b4044]/50">Daily Volume Limit</h3>
                  <span className="text-xs font-bold text-[#3b4044]">{limitPct.toFixed(1)}%</span>
                </div>
                
                <div className="w-full h-3 bg-[#3b4044]/10 rounded-full overflow-hidden shrink-0 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${limitPct}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "absolute top-0 left-0 h-full rounded-full transition-colors duration-500",
                      limitPct > 90 ? "bg-red-500" : limitPct > 75 ? "bg-[#d95000]" : "bg-emerald-500"
                    )}
                  />
                </div>
                
                <div className="mt-4 flex justify-between text-xs font-bold text-[#3b4044]/40">
                  <span>${(subsidiary.dailyTransferTotal.toNumber() / 1_000_000).toLocaleString()} Used</span>
                  <span>${poolVault ? (poolVault.dailyLimitUsdc.toNumber() / 1_000_000).toLocaleString() : '---'} Max</span>
                </div>
              </GlassCard>
            </div>

            {/* Right Col: Deposit Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard variant="subtle" className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-[#3b4044]/5 rounded-xl border border-[#3b4044]/10">
                    <Wallet className="w-5 h-5 text-[#3b4044]" strokeWidth={2} />
                  </div>
                  <h2 className="font-black text-xl tracking-tighter text-[#3b4044]">Fund Treasury</h2>
                </div>

                <div className="flex gap-2 mb-6 p-1 bg-[#3b4044]/5 rounded-xl border border-[#3b4044]/10 max-w-[200px]">
                  <button 
                    onClick={() => setCurrency(0)}
                    className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", currency === 0 ? "bg-white text-[#3b4044] shadow-sm" : "text-[#3b4044]/50 hover:text-[#3b4044]")}
                  >
                    USDC
                  </button>
                  <button 
                    onClick={() => setCurrency(1)}
                    className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", currency === 1 ? "bg-white text-[#3b4044] shadow-sm" : "text-[#3b4044]/50 hover:text-[#3b4044]")}
                  >
                    EURC
                  </button>
                </div>

                <div className="flex flex-col gap-4 relative z-10 mb-8">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-[#3b4044]/50 uppercase tracking-[0.15em]">
                      Deposit Amount
                    </label>
                    {currency === 0 && (
                      <button onClick={handleMintDemoUSDC} disabled={isMinting} className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500">
                        {isMinting ? "Minting..." : "Mint Demo USDC \u2192"}
                      </button>
                    )}
                  </div>
                  <GlassInput
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="text-2xl py-5 bg-white/40"
                  />
                </div>

                <GlassButton
                  variant="accent"
                  onClick={handleDeposit}
                  disabled={!amount || isProcessing}
                  className="w-full flex items-center justify-center gap-3 py-4 text-base shadow-xl"
                >
                  {isProcessing ? "Processing..." : "Deposit Funds"}
                  <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </GlassCard>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}
