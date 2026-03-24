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
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GlassCard, GlassBadge, cn } from "@/components/ui/Glass";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
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
      "Automatically routes idle capital to Kamino Finance reserve pools for risk-adjusted returns with institutional security.",
    color: "#d95000",
    gradient: "from-[#d95000]/20 to-[#ffb43f]/10",
    href: "/deposit",
  },
  {
    icon: Zap,
    title: "Jupiter Fallback",
    description:
      "Best-in-class liquidity routing ensures maximum efficiency for massive corporate treasury FX swaps.",
    color: "#ffb43f",
    gradient: "from-[#ffb43f]/20 to-[#e3be81]/10",
    href: "/swap",
  },
  {
    icon: ShieldCheck,
    title: "Compliant Flow",
    description:
      "Multi-layer verification via Token-2022 Transfer Hooks ensuring every transaction meets global compliance standards.",
    color: "#d357fe",
    gradient: "from-[#d357fe]/20 to-[#9b59b6]/10",
    href: "/",
  },
];

const stats = [
  { label: "Active TVL", value: "$32.8M", icon: TrendingUp },
  { label: "Market Pairs", value: "48+", icon: Globe },
  { label: "Uptime Rate", value: "99.9%", icon: Lock },
];

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* ─── HERO ─── */}
      <section className="w-full px-4 pt-32 md:px-8 md:pt-40">
        <div className="relative w-full h-[85vh] md:h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl">
          {/* Grainient Background */}
          <div className="absolute inset-0 z-0">
            <Grainient
              color1="#d95000"
              color2="#ffb43f"
              color3="#d357fe"
              timeSpeed={0.2}
              colorBalance={0}
              warpStrength={1}
              warpFrequency={5}
              warpSpeed={1.5}
              warpAmplitude={50}
              blendAngle={180}
              blendSoftness={0.57}
              rotationAmount={400}
              noiseScale={2}
              grainAmount={0.05}
              grainScale={2.5}
              grainAnimated={false}
              contrast={1.4}
              gamma={1}
              saturation={1.1}
              centerX={0}
              centerY={0}
              zoom={1}
            />
          </div>

          {/* Overlay Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassBadge className="mb-8 text-[#3b4044]/60 bg-white/40 border-white/60">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                Secured by Akari Protocol
              </GlassBadge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.95] text-[#3b4044] max-w-5xl"
            >
              The Next
              <br />
              <span className="text-white drop-shadow-sm">Treasury</span> Standard
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 text-lg md:text-xl text-[#3b4044]/60 max-w-xl leading-relaxed font-bold"
            >
              Institutional yield, frictionless swaps, and verified compliance
              — unified in a single liquidity engine.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/deposit"
                className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-base font-black bg-[#3b4044] text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1"
              >
                Start Deploying
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/swap"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-base font-bold liquid-glass-strong text-[#3b4044]/80 hover:bg-white/40 transition-all duration-300"
              >
                Explore Swaps
              </Link>
            </motion.div>
          </div>

          {/* Elegant bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#f4ecde] to-transparent z-10" />
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="w-full px-4 -mt-10 md:px-8 relative z-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="container-wide grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={i}
            >
              <GlassCard
                variant="strong"
                className="flex items-center gap-8 p-10 md:p-12"
              >
                <div className="p-3.5 rounded-[1.25rem] bg-gradient-to-br from-[#e3be81]/30 to-[#d95000]/10 border border-white/40">
                  <stat.icon className="w-6 h-6 text-[#d95000]" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-3xl font-black tracking-tighter text-[#3b4044]">{stat.value}</div>
                  <div className="text-[10px] font-black text-[#3b4044]/40 uppercase tracking-[0.2em] mt-1">
                    {stat.label}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="w-full px-4 py-32 md:px-8 md:py-52">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <GlassBadge className="mb-6 text-[#3b4044]/50">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e3be81]" />
              Institutional Core
            </GlassBadge>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-[#3b4044] leading-tight">
              Institutional-Grade{" "}
              <span className="gradient-text-accent">DeFi Flow</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div key={feature.title} variants={fadeUp} custom={i}>
                <Link href={feature.href} className="block h-full">
                  <GlassCard className="h-full group cursor-pointer liquid-glass-hover flex flex-col gap-10 p-10 md:p-14">
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-16 h-16 rounded-[1.5rem] bg-gradient-to-br flex items-center justify-center border border-white/50 shadow-lg group-hover:scale-110 transition-transform duration-500",
                        feature.gradient
                      )}
                    >
                      <feature.icon
                        className="w-7 h-7"
                        style={{ color: feature.color }}
                        strokeWidth={2}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3 text-[#3b4044]">
                        {feature.title}
                        <ChevronRight className="w-5 h-5 text-[#3b4044]/20 group-hover:text-[#3b4044]/60 group-hover:translate-x-1 transition-all duration-300" />
                      </h3>
                      <p className="text-[#3b4044]/60 text-base leading-relaxed font-bold">
                        {feature.description}
                      </p>
                    </div>

                    {/* Dynamic glow effect */}
                    <div
                      className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
                      style={{ backgroundColor: feature.color }}
                    />
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="w-full px-4 pb-32 md:px-8 md:pb-52">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard
              variant="strong"
              className="relative overflow-hidden px-10 py-24 md:px-24 md:py-40 text-center"
            >
              {/* Background Ambient Orbs */}
              <div className="absolute top-0 left-0 w-96 h-96 bg-[#d95000]/15 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-[#d357fe]/15 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#e3be81]/15 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

              <div className="relative z-10">
                <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 text-[#3b4044] leading-tight">
                  Modernized Treasury<br />
                  <span className="gradient-text-accent">Starts Here.</span>
                </h2>
                <p className="text-[#3b4044]/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 font-bold">
                  Deploy capital into yield-bearing strategies with
                  institutional compliance, built on the speed of Solana.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/deposit"
                    className="inline-flex items-center justify-center gap-3 px-12 py-6 rounded-2xl text-lg font-black bg-[#3b4044] text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1"
                  >
                    Deploy Capital
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/swap"
                    className="inline-flex items-center justify-center gap-3 px-12 py-6 rounded-2xl text-lg font-bold liquid-glass-strong text-[#3b4044] hover:bg-white/40 transition-all duration-300 shadow-xl"
                  >
                    Explore FX
                  </Link>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
