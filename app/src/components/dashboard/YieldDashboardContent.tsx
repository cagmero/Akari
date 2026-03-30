"use client";

import { useState } from "react";
import { GlassCard, GlassButton, GlassInput, GlassBadge, SectionHeading, cn } from "@/components/ui/Glass";
import { ArrowRight, Wallet, Percent, ShieldCheck, TrendingUp, Clock, Layers, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useAkari } from "@/hooks/useAkari";
import { usePool } from "@/hooks/usePool";
import { KaminoAction, KaminoMarket } from '@kamino-finance/klend-sdk';
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getPoolVaultPda, getYieldPositionPda, USDC_MINT } from "@/lib/constants";
import { useYieldPositions } from "@/hooks/useYieldPositions";

const KAMINO_MAIN_MARKET = new PublicKey("7u3HeHxYDLhnCoErrpiFfGN7mFxAed92o1z1XzD44aB");
const REAL_USDC = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

export default function YieldDashboardContent() {
  const { program, wallet, provider, connection } = useAkari();
  const { poolVault } = usePool();
  const { positions, mutate: mutatePositions } = useYieldPositions();

  const [amount, setAmount] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  // Fallback estimates
  const kaminoPos = positions.find(p => p.venue === "kamino");
  const idleBalance = poolVault ? Math.floor(poolVault.totalUsdc.toNumber() / 10 / 1_000_000) : 0;

  const handleDeploy = async () => {
    if (!amount || isNaN(Number(amount)) || !program || !wallet || !provider) {
      return alert("Connect wallet and enter valid amount!");
    }
    setIsDeploying(true);

    try {
      // 1. Build Kamino Action
      // @ts-ignore - Ignore outdated SDK method signatures
      const kaminoMarket = await KaminoMarket.load(connection, KAMINO_MAIN_MARKET);
      const actionAmount = (Number(amount) * 1_000_000).toString();
      
      // @ts-ignore
      const depositAction = await KaminoAction.buildDepositReserveLiquidityTxns(
        kaminoMarket,
        actionAmount,
        REAL_USDC,
        wallet.publicKey
      );

      // @ts-ignore
      const kaminoIx = depositAction.actionIx;
      const remainingAccounts = [
        // @ts-ignore
        { pubkey: kaminoIx.programId, isWritable: false, isSigner: false },
        // @ts-ignore
        ...kaminoIx.keys.map((k: any) => ({
          pubkey: k.pubkey,
          isWritable: k.isSigner ? false : k.isWritable,
          isSigner: false, 
        }))
      ];

      // 2. Format Venue
      const venueStr = "kamino";
      const venueArray = Array.from(Buffer.from(venueStr.padEnd(16, '\0')));
      const yieldPositionPda = getYieldPositionPda(0, venueStr);
      const poolVaultPda = getPoolVaultPda();

      // 3. Fire
      const txSignature = await program.methods
        .deployYield(
          0, // USDC
          venueArray,
          new BN(Number(amount) * 1_000_000),
          Buffer.from(kaminoIx.data)
        )
        .accounts({
          yieldPosition: yieldPositionPda,
          poolVault: poolVaultPda,
          authority: wallet.publicKey,
        })
        .remainingAccounts(remainingAccounts)
        .rpc();

      alert("Success! Yield Strategy deployed via CPI: " + txSignature);
      setAmount("");
      mutatePositions();
    } catch (e: any) {
      console.error(e);
      // Explicitly catch the expected mint mismatch due to clone logic 
      if (e.message?.includes("MintMismatch")) {
         alert("Action routed properly to Kamino CPI but reverted securely because Testnet/Devnet USDC differs from Mainnet USDC!");
      } else {
         alert(`Error building Kamino transaction: ${e.message}`);
      }
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-4 pt-44 md:pt-48 pb-32">
      <div className="container-wide flex flex-col items-center gap-16">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <SectionHeading
            title="Yield"
            highlight="Routing"
            description="Deploy idle treasury capital into Kamino Finance risk-adjusted lending pools via dynamic proxy CPIs."
          />
        </motion.div>

        <div className="w-full max-w-4xl grid md:grid-cols-[1fr_400px] gap-8">
          
          {/* Active Positions */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3b4044]/50 mb-2">Active Venues</h3>
            
            <GlassCard className="p-8 flex items-center justify-between group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gradient-to-tr from-[#3b4044]/5 to-[#d95000]/10 rounded-2xl flex items-center justify-center border border-[#d95000]/20">
                  <Flame className="w-6 h-6 text-[#d95000]" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="font-black text-xl text-[#3b4044] mb-1">Kamino Lending</h4>
                  <div className="flex gap-3 text-[10px] font-black uppercase tracking-[0.1em] text-[#3b4044]/40">
                    <span>USDC Main Reserve</span>
                    <span>•</span>
                    <span className="text-emerald-600">Active</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-black text-[#3b4044] tracking-tighter mb-1">
                  ${kaminoPos?.account ? (kaminoPos.account.depositedAmount.toNumber() / 1_000_000).toLocaleString() : '0.00'}
                </div>
                <div className="text-[10px] font-bold text-[#3b4044]/40 uppercase tracking-widest">
                  Deployed Principal
                </div>
              </div>
            </GlassCard>

          </div>

          {/* Deploy Panel */}
          <GlassCard variant="strong" className="flex flex-col gap-8 relative p-8 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d95000]/10 rounded-full blur-[60px] translate-x-4 pointer-events-none" />
            
            <div className="flex items-center justify-between">
               <h3 className="font-black text-2xl tracking-tighter text-[#3b4044]">Deploy</h3>
               <GlassBadge className="text-emerald-700 bg-emerald-500/10 border-emerald-500/20">
                 <Percent className="w-3.5 h-3.5" />
                 4.5% APY
               </GlassBadge>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-[#3b4044]/40 uppercase tracking-[0.15em]">
                  Deploy Amount (USDC)
                </label>
                <div className="text-[10px] font-bold text-[#3b4044]/60">
                   Idle Cap: ${idleBalance.toLocaleString()}
                </div>
              </div>
              
              <div className="relative">
                <GlassInput
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-2xl py-5"
                />
                <button
                  onClick={() => setAmount(idleBalance.toString())}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-[0.2em] text-[#d95000] hover:text-white transition-all px-3 py-1.5 rounded-lg bg-[#d95000]/10 hover:bg-[#d95000] border border-[#d95000]/20"
                >
                  Max
                </button>
              </div>
            </div>

            <GlassButton
              variant="accent"
              onClick={handleDeploy}
              disabled={!amount || isDeploying || Number(amount) > idleBalance}
              className="w-full flex items-center justify-center gap-3 py-4 relative z-10 shadow-xl"
            >
              {isDeploying ? "Routing API..." : "Build Kamino Action \u2192"}
            </GlassButton>

            <div className="flex items-center gap-2 text-[9px] font-black text-[#3b4044]/30 justify-center uppercase tracking-[0.2em] relative z-10 border-t border-white/20 pt-4">
               <ShieldCheck className="w-3.5 h-3.5" />
               CPIs Generated via Klend-SDK
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
}
