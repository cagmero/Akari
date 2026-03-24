"use client";

import Grainient from "@/components/ui/Grainient";
import {
  Activity,
  Zap,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Globe,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GlassCard, GlassBadge } from "@/components/ui/Glass";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const features = [
  {
    icon: Activity,
    title: "Smart Yield",
    description:
      "Automatically routes idle capital to Kamino Finance reserve pools for risk-adjusted returns using zero-mock CPI execution.",
    color: "#d95000",
    gradient: "from-[#d95000]/15 to-[#ffb43f]/10",
    href: "/deposit",
  },
  {
    icon: Zap,
    title: "Jupiter Fallback",
    description:
      "Directional pricing powered by exact route execution ensures maximum liquidity for massive corporate FX swaps.",
    color: "#ffb43f",
    gradient: "from-[#ffb43f]/15 to-[#e3be81]/10",
    href: "/swap",
  },
  {
    icon: ShieldCheck,
    title: "Compliant Transfers",
    description:
      "Every transaction is verified against an on-chain Merkle proof via Token-2022 Transfer Hooks for full KYC/AML compliance.",
    color: "#d357fe",
    gradient: "from-[#d357fe]/15 to-[#9b59b6]/10",
    href: "/",
  },
];

const stats = [
  { label: "TVL Deployed", value: "$12.4M", icon: TrendingUp },
  { label: "Supported FX Pairs", value: "24+", icon: Globe },
  { label: "Compliance Score", value: "100%", icon: Lock },
];

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* ─── HERO ─── */}
      <section className="w-full px-4 pt-24 md:px-6 md:pt-28">
        <div className="relative w-full h-[75vh] md:h-[88vh] rounded-[2rem] overflow-hidden">
          {/* Grainient Background */}
          <Grainient
            color1="#d95000"
            color2="#ffb43f"
            color3="#d357fe"
            timeSpeed={0.25}
            colorBalance={0}
            warpStrength={1}
            warpFrequency={5}
            warpSpeed={2}
            warpAmplitude={50}
            blendAngle={180}
            blendSoftness={0.57}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0.06}
            grainScale={2.6}
            grainAnimated={false}
            contrast={1.5}
            gamma={1}
            saturation={1}
            centerX={0}
            centerY={0}
            zoom={0.9}
          />

          {/* Overlay Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassBadge className="mb-6 text-white/80 border-white/20 bg-white/10 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live on Solana Mainnet
              </GlassBadge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-white max-w-4xl"
            >
              Corporate
              <br />
              <span className="text-white/60">Treasure</span> Engine
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-base md:text-lg text-white/50 max-w-lg leading-relaxed font-medium"
            >
              On-chain yield, compliant FX swaps, and Merkle-verified transfers
              — all in one treasury protocol.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/deposit"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold bg-white text-[#3b4044] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Deploying
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/swap"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold bg-white/10 text-white/90 border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300"
              >
                Explore Swaps
              </Link>
            </motion.div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f4ecde] to-transparent z-10" />
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="w-full px-4 -mt-6 md:px-6 relative z-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={i}
            >
              <GlassCard
                variant="strong"
                className="flex items-center gap-4 p-5 md:p-6"
              >
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#e3be81]/30 to-[#d95000]/10">
                  <stat.icon className="w-5 h-5 text-[#d95000]" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="text-2xl font-extrabold tracking-tight">{stat.value}</div>
                  <div className="text-xs font-semibold text-[#3b4044]/45 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="w-full px-4 py-20 md:px-6 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <GlassBadge className="mb-5 text-[#3b4044]/60">
            <div className="w-1.5 h-1.5 rounded-full bg-[#e3be81]" />
            Protocol Features
          </GlassBadge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Institutional-Grade{" "}
            <span className="gradient-text-accent">DeFi</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {features.map((feature, i) => (
            <motion.div key={feature.title} variants={fadeUp} custom={i}>
              <Link href={feature.href} className="block h-full">
                <GlassCard className="h-full group cursor-pointer liquid-glass-hover flex flex-col gap-5 p-7 md:p-8">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center border border-white/30 group-hover:scale-105 transition-transform duration-300`}
                  >
                    <feature.icon
                      className="w-5 h-5"
                      style={{ color: feature.color }}
                      strokeWidth={1.8}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                      {feature.title}
                      <ArrowRight className="w-4 h-4 text-[#3b4044]/30 group-hover:text-[#3b4044]/60 group-hover:translate-x-1 transition-all duration-300" />
                    </h3>
                    <p className="text-[#3b4044]/55 text-sm leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </div>

                  {/* Subtle glow */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                    style={{ backgroundColor: `${feature.color}20` }}
                  />
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="w-full px-4 pb-20 md:px-6 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl mx-auto"
        >
          <GlassCard
            variant="strong"
            className="relative overflow-hidden px-8 py-14 md:px-14 md:py-20 text-center"
          >
            {/* Ambient orbs */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-[#d95000]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#d357fe]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-[#e3be81]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5">
                Ready to deploy your{" "}
                <span className="gradient-text-accent">treasury?</span>
              </h2>
              <p className="text-[#3b4044]/50 text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-8 font-medium">
                Start earning yield on idle capital with institutional-grade
                compliance, all on Solana.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/deposit"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-[#3b4044] to-[#4a5056] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Deploy Capital
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/swap"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold liquid-glass liquid-glass-hover"
                >
                  Explore FX Swaps
                </Link>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>
    </div>
  );
}
