// @ts-nocheck
"use client";

import { useState } from "react";
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassBadge,
  SectionHeading,
  cn,
} from "@/components/ui/Glass";
import {
  ArrowRight,
  Wallet,
  Percent,
  ShieldCheck,
  TrendingUp,
  Clock,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import { buildKaminoDeposit } from "@/app/actions/kamino";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const poolInfo = [
  { label: "Current APY", value: "4.5%", icon: TrendingUp, color: "text-emerald-600" },
  { label: "Lock Period", value: "None", icon: Clock, color: "text-[#d95000]" },
  { label: "Protocol", value: "Kamino", icon: Layers, color: "text-[#3b4044]" },
];

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    if (!amount || isNaN(Number(amount))) return;
    setIsDeploying(true);

    try {
      const result = await buildKaminoDeposit(amount);

      console.log("Kamino Instruction built via Server Action:");
      console.log("Instruction Data Length:", result.dataLength);
      console.log("Remaining Accounts:", result.accounts);

      alert(
        "Success! Kamino Deposit Instruction built entirely dynamically. Ready to be sent to Akari CPI."
      );
      setAmount("");
    } catch (e) {
      console.error(e);
      alert("Error building Kamino transaction. See console.");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-4 pt-44 md:pt-60 pb-32">
      <div className="container-wide flex flex-col items-center gap-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            title="Institutional"
            highlight="Yield"
            description="Deploy idle treasury capital into Kamino Finance risk-adjusted lending pools via Akari dynamic proxy CPIs."
          />
        </motion.div>

        {/* Pool Info Cards */}
        <div className="w-full max-w-3xl flex flex-col gap-10">
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 gap-8 w-full"
          >
            {poolInfo.map((info, i) => (
              <motion.div key={info.label} variants={fadeUp} custom={i}>
                <GlassCard variant="subtle" className="p-10 text-center flex flex-col items-center gap-5">
                  <div className="p-3.5 rounded-2xl bg-white/40 border border-white/60">
                    <info.icon className={cn("w-6 h-6", info.color)} strokeWidth={2} />
                  </div>
                  <div className="text-3xl font-black tracking-tighter text-[#3b4044]">{info.value}</div>
                  <div className="text-[10px] font-black text-[#3b4044]/40 uppercase tracking-[0.2em]">
                    {info.label}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Deposit Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <GlassCard variant="strong" className="flex flex-col gap-12 relative p-12 md:p-16">
              {/* Refined Glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d95000]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#e3be81]/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-[#d95000]/20 to-[#ffb43f]/10 rounded-2xl border border-white/50 shadow-lg">
                    <Wallet className="w-6 h-6 text-[#d95000]" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="font-black text-2xl tracking-tighter text-[#3b4044]">Deploy USDC</h2>
                    <p className="text-xs text-[#3b4044]/40 font-bold uppercase tracking-wider">
                      Target: Kamino Main Reserve
                    </p>
                  </div>
                </div>
                <GlassBadge className="text-emerald-700 bg-emerald-500/10 border-emerald-500/20">
                  <Percent className="w-3.5 h-3.5" />
                  4.5% APY
                </GlassBadge>
              </div>

              {/* Input */}
              <div className="flex flex-col gap-5 relative z-10">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[11px] font-black text-[#3b4044]/40 uppercase tracking-[0.15em]">
                    Amount (USDC)
                  </label>
                  <span className="text-[10px] font-bold text-[#3b4044]/30">Available: 1,240,500.00</span>
                </div>
                <div className="relative">
                  <GlassInput
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="text-2xl py-6"
                  />
                  <button
                    onClick={() => setAmount("100000")}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-[0.2em] text-[#d95000] hover:text-[#3b4044] transition-all px-4 py-2 rounded-xl bg-[#d95000]/10 hover:bg-[#d95000]/20 border border-[#d95000]/10"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Deploy Button */}
              <GlassButton
                variant="accent"
                onClick={handleDeploy}
                disabled={!amount || isDeploying}
                className="w-full flex items-center justify-center gap-3 py-6 relative z-10 text-lg shadow-2xl"
              >
                {isDeploying ? (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Building Route...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    Deploy to Kamino
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </GlassButton>

              {/* Security note */}
              <div className="flex items-center gap-3 text-[10px] font-black text-[#3b4044]/30 justify-center uppercase tracking-[0.2em] relative z-10 pt-2 border-t border-white/20">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified by Akari Transfer Hooks</span>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
