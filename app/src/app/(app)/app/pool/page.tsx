"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAkari } from "@/hooks/useAkari";
import { usePool } from "@/hooks/usePool";
import { useSubsidiaries } from "@/hooks/useSubsidiaries";
import { GlassCard, GlassButton, GlassInput, cn } from "@/components/ui/Glass";
import { 
  ArrowRight, 
  Wallet, 
  Layers, 
  ShieldCheck, 
  Copy, 
  ChevronRight,
  Send,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BN } from "@coral-xyz/anchor";
import { getPoolVaultPda, USDC_MINT, EURC_MINT } from "@/lib/constants";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { generateProof } from "@/lib/merkle";

export default function PoolPage() {
  const searchParams = useSearchParams();
  const { program, wallet } = useAkari();
  const { poolVault, mutate: mutatePool } = usePool();
  const { subsidiaries, mutate: mutateSubs } = useSubsidiaries();
  
  const [selectedEntityPubkey, setSelectedEntityPubkey] = useState<string | null>(null);
  const [currency, setCurrency] = useState<0 | 1>(0); // 0=USDC, 1=EURC
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Travel Rule Fields
  const [receiverVasp, setReceiverVasp] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");

  const selectedSub = subsidiaries.find(s => s.publicKey.toBase58() === selectedEntityPubkey);

  useEffect(() => {
    const entityParam = searchParams.get("entity");
    if (entityParam) {
      setSelectedEntityPubkey(entityParam);
    } else if (subsidiaries.length > 0 && !selectedEntityPubkey) {
      setSelectedEntityPubkey(subsidiaries[0].publicKey.toBase58());
    }
  }, [searchParams, subsidiaries, selectedEntityPubkey]);

  const withdrawAmount = Number(amount) || 0;
  const travelRuleThreshold = 3000; // $3,000 threshold
  const showTravelRule = withdrawAmount >= travelRuleThreshold;

  const handleDeposit = async () => {
    if (!selectedSub || !amount || !program || !wallet) return;
    setIsProcessing(true);
    try {
      const pda = getPoolVaultPda();
      const mint = currency === 0 ? USDC_MINT : EURC_MINT;
      const userAta = getAssociatedTokenAddressSync(mint, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
      const poolAta = getAssociatedTokenAddressSync(mint, pda, true, TOKEN_2022_PROGRAM_ID);
      const proof = generateProof(wallet.publicKey.toBase58());

      await program.methods
        .deposit(new BN(withdrawAmount * 1_000_000), currency)
        .accounts({
          owner: wallet.publicKey,
          poolVault: pda,
          subsidiaryAccount: selectedSub.publicKey,
          subsidiaryAta: userAta,
          poolAta: poolAta,
          mint: mint,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .rpc();
        
      alert("Deposit successful!");
      mutatePool();
      mutateSubs();
    } catch (e: any) {
      console.error(e);
      alert("Deposit failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedSub || !amount || !program || !wallet) return;
    setIsProcessing(true);
    try {
      const pda = getPoolVaultPda();
      const mint = currency === 0 ? USDC_MINT : EURC_MINT;
      const userAta = getAssociatedTokenAddressSync(mint, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
      const poolAta = getAssociatedTokenAddressSync(mint, pda, true, TOKEN_2022_PROGRAM_ID);

      await program.methods
        .withdraw(new BN(withdrawAmount * 1_000_000), currency)
        .accounts({
          owner: wallet.publicKey,
          subsidiaryAccount: selectedSub.publicKey,
          subsidiaryAta: userAta,
          poolAta: poolAta,
          mint: mint,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .rpc();

      alert("Withdrawal successful!");
      mutatePool();
      mutateSubs();
    } catch (e: any) {
      console.error(e);
      alert("Withdrawal failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const decodeString = (arr: number[]) => {
    if (!arr || !Array.isArray(arr)) return '---';
    return new TextDecoder().decode(Uint8Array.from(arr)).replace(/\0/g, '');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-8 max-w-[1400px] mx-auto">
      
      {/* Left Column: Selector & Details */}
      <div className="space-y-8">
        {/* Entity Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {subsidiaries.slice(0, 3).map((sub: any) => {
             const isSelected = selectedEntityPubkey === sub.publicKey.toBase58();
             const totalValue = (sub.account.usdcBalance.toNumber() + sub.account.eurcBalance.toNumber()) / 1_000_000;
             return (
               <GlassCard 
                  key={sub.publicKey.toBase58()}
                  onClick={() => setSelectedEntityPubkey(sub.publicKey.toBase58())}
                  className={cn(
                    "p-6 cursor-pointer transition-all duration-300 border-2",
                    isSelected ? "border-[#3b4044] bg-white/60 shadow-xl scale-[1.02]" : "border-transparent hover:border-[#3b4044]/20 hover:bg-white/20"
                  )}
               >
                  <div className="flex flex-col gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40">Subsidiary</span>
                     <span className="text-lg font-black tracking-tighter text-[#3b4044] truncate">{decodeString(sub.account.vaspId)}</span>
                     <span className="text-sm font-black text-[#3b4044]/60">${totalValue.toLocaleString()} TVL</span>
                  </div>
               </GlassCard>
             );
           })}
        </div>

        {/* Detail Panel */}
        {selectedSub && (
          <GlassCard variant="strong" className="p-10 space-y-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d95000]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex justify-between items-start relative z-10">
               <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tighter text-[#3b4044]">{decodeString(selectedSub.account.vaspId)}</h2>
                  <div className="flex items-center gap-2">
                     <GlassBadge className="bg-[#3b4044]/5 text-[#3b4044]/60">EU / VASP</GlassBadge>
                     <span className="text-[10px] font-bold text-[#3b4044]/30 uppercase tracking-widest">Registered {new Date().toLocaleDateString()}</span>
                  </div>
               </div>
               <div className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border", selectedSub.account.flagged ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>
                  {selectedSub.account.flagged ? "● Flagged" : "● Active"}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 relative z-10">
               <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40">USDC Balance</span>
                  <div className="text-3xl font-black text-[#3b4044] tabular-nums">${(selectedSub.account.usdcBalance.toNumber() / 1_000_000).toLocaleString()}</div>
               </div>
               <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40">EURC Balance</span>
                  <div className="text-3xl font-black text-[#3b4044]/60 tabular-nums">€{(selectedSub.account.eurcBalance.toNumber() / 1_000_000).toLocaleString()}</div>
               </div>
            </div>

            <div className="space-y-4 relative z-10">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-[#3b4044]/40">Daily Transfers: <span className="text-[#3b4044]">${(selectedSub.account.dailyTransferTotal.toNumber() / 1_000_000).toLocaleString()} / $100,000</span></span>
               </div>
               <div className="h-1.5 w-full bg-[#3b4044]/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${(selectedSub.account.dailyTransferTotal.toNumber() / 100_000_000_000) * 100}%` }}
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-12 pt-12 border-t border-[#3b4044]/5 relative z-10">
               <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40">VASP ID</span>
                  <div className="flex items-center justify-between p-3 bg-[#3b4044]/5 rounded-xl border border-[#3b4044]/5">
                     <span className="text-[10px] font-mono font-bold text-[#3b4044]">VASP-8849-AKRI</span>
                     <Copy size={12} className="text-[#3b4044]/40 cursor-pointer" />
                  </div>
               </div>
               <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40">KYC Hash</span>
                  <div className="flex items-center justify-between p-3 bg-[#3b4044]/5 rounded-xl border border-[#3b4044]/5">
                     <span className="text-[10px] font-mono font-bold text-[#3b4044]">e3b0c442...</span>
                     <Copy size={12} className="text-[#3b4044]/40 cursor-pointer" />
                  </div>
               </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Right Column: Acton Panels */}
      <div className="space-y-6">
         {/* Deposit Card */}
         <GlassCard className="p-8 space-y-8">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-600">
                  <Download size={20} />
               </div>
               <h3 className="text-xl font-black tracking-tighter text-[#3b4044]">Deposit</h3>
            </div>

            <div className="flex gap-2 p-1 bg-[#3b4044]/5 rounded-2xl border border-[#3b4044]/5">
               <button 
                  onClick={() => setCurrency(0)}
                  className={cn("flex-1 py-3 text-xs font-black rounded-xl transition-all", currency === 0 ? "bg-white text-[#3b4044] shadow-sm" : "text-[#3b4044]/40")}
               >
                  USDC
               </button>
               <button 
                  onClick={() => setCurrency(1)}
                  className={cn("flex-1 py-3 text-xs font-black rounded-xl transition-all", currency === 1 ? "bg-white text-[#3b4044] shadow-sm" : "text-[#3b4044]/40")}
               >
                  EURC
               </button>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40">Amount</span>
                  <button className="text-[9px] font-black text-[#d95000] hover:underline uppercase tracking-widest">Max</button>
               </div>
               <GlassInput 
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-2xl font-black py-6"
               />
               <p className="text-[10px] font-bold text-[#3b4044]/40 italic px-1">
                 KYC Transfer Hook verifies recipient before settlement
               </p>
            </div>

            <GlassButton 
               variant="accent" 
               onClick={handleDeposit}
               disabled={isProcessing || !amount}
               className="w-full py-5 text-base font-black flex items-center justify-center gap-3"
            >
               {isProcessing ? "Processing..." : "Deposit Funds"}
               <ArrowRight size={18} />
            </GlassButton>
         </GlassCard>

         {/* Withdraw Card */}
         <GlassCard className="p-8 space-y-8">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-[#d95000]/10 rounded-xl border border-[#d95000]/20 text-[#d95000]">
                  <Send size={20} />
               </div>
               <h3 className="text-xl font-black tracking-tighter text-[#3b4044]">Withdraw</h3>
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40 px-1">Amount</span>
                  <GlassInput 
                     type="number"
                     placeholder="0.00"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     className="text-xl font-black py-4 bg-[#3b4044]/5"
                  />
               </div>

               <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40 px-1">Recipient Address</span>
                  <GlassInput 
                     placeholder="Connect Bank or Wallet..."
                     value={recipient}
                     onChange={(e) => setRecipient(e.target.value)}
                     className="text-xs font-mono py-4 bg-[#3b4044]/5"
                  />
               </div>

               {/* Travel Rule Expansion */}
               <AnimatePresence>
                  {showTravelRule && (
                    <motion.div 
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="overflow-hidden space-y-4"
                    >
                       <div className="p-5 bg-amber-500/5 rounded-2xl border border-amber-500/20 space-y-4">
                          <div className="flex items-center gap-2 text-amber-600">
                             <ShieldCheck size={16} />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Travel Rule Applies</span>
                          </div>
                          <p className="text-[10px] font-bold text-amber-900/60 leading-relaxed">
                            This transfer will be recorded on-chain with mandatory PII hashes as per global compliance standards.
                          </p>
                          <div className="space-y-3 pt-2">
                             <GlassInput 
                                placeholder="Receiver VASP ID" 
                                value={receiverVasp}
                                onChange={(e) => setReceiverVasp(e.target.value)}
                                className="text-[10px] py-3 bg-white/50 border-amber-500/10 placeholder:text-amber-900/30" 
                             />
                             <GlassInput 
                                placeholder="Beneficiary Legal Name" 
                                value={beneficiaryName}
                                onChange={(e) => setBeneficiaryName(e.target.value)}
                                className="text-[10px] py-3 bg-white/50 border-amber-500/10 placeholder:text-amber-900/30" 
                             />
                          </div>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>

            <GlassButton 
               variant="subtle" 
               onClick={handleWithdraw}
               disabled={isProcessing || !amount || (showTravelRule && (!receiverVasp || !beneficiaryName))}
               className="w-full py-5 text-base font-black flex items-center justify-center gap-3 border border-[#3b4044]/10"
            >
               {isProcessing ? "Processing..." : "Execute Withdrawal"}
            </GlassButton>
         </GlassCard>
      </div>

    </div>
  );
}

function GlassBadge({ children, className }: any) {
    return <div className={cn("px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase border", className)}>{children}</div>;
}
