// @ts-nocheck
"use client";

import { useState } from "react";
import {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassBadge,
  SectionHeading,
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
      duration: 0.6,
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
    <div className="flex flex-col items-center w-full px-4 max-w-5xl mx-auto gap-10 pt-32 md:pt-36 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionHeading
          badge="Kamino Finance Integration"
          title="Corporate"
          highlight="Yield"
          description="Deploy idle treasury capital into Kamino Finance risk-adjusted lending pools via dynamic proxy CPIs."
        />
      </motion.div>

      {/* Pool Info Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-3 w-full max-w-md"
      >
        {poolInfo.map((info, i) => (
          <motion.div key={info.label} variants={fadeUp} custom={i}>
            <GlassCard variant="subtle" className="p-4 text-center flex flex-col items-center gap-2">
              <info.icon className={`w-4 h-4 ${info.color}`} strokeWidth={1.8} />
              <div className="text-lg font-extrabold tracking-tight">{info.value}</div>
              <div className="text-[10px] font-semibold text-[#3b4044]/40 uppercase tracking-widest">
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
        transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <GlassCard variant="strong" className="flex flex-col gap-6 relative">
          {/* Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#d95000]/12 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#e3be81]/12 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#d95000]/15 to-[#ffb43f]/10 rounded-xl border border-white/30">
                <Wallet className="w-5 h-5 text-[#d95000]" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="font-bold text-lg">Deploy USDC</h2>
                <p className="text-xs text-[#3b4044]/40 font-medium">
                  Into Kamino Reserve
                </p>
              </div>
            </div>
            <GlassBadge className="text-emerald-700 bg-emerald-500/10 border-emerald-500/20">
              <Percent className="w-3 h-3" />
              4.5% APY
            </GlassBadge>
          </div>

          {/* Input */}
          <div className="flex flex-col gap-2 relative z-10">
            <label className="text-xs font-bold text-[#3b4044]/50 ml-1 uppercase tracking-wider">
              Amount (USDC)
            </label>
            <div className="relative">
              <GlassInput
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              <button
                onClick={() => setAmount("100000")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-extrabold uppercase tracking-widest text-[#d95000] hover:text-[#3b4044] transition-colors px-2.5 py-1 rounded-lg bg-[#d95000]/8 hover:bg-[#d95000]/15"
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
            className="w-full flex items-center justify-center gap-2 py-4 relative z-10"
          >
            {isDeploying ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Building SDK Transaction...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Deploy to Kamino
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </GlassButton>

          {/* Security note */}
          <div className="flex items-center gap-2 text-[10px] font-semibold text-[#3b4044]/35 justify-center uppercase tracking-widest relative z-10">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secured by Akari Transfer Hook Proxies</span>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
