"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard, cn } from "@/components/ui/Glass";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="w-full px-4 pb-12 md:px-8 md:pb-16"
    >
      <div className="container-wide">
        <GlassCard className="w-full flex flex-col md:flex-row items-center justify-between gap-10 px-10 py-10 md:py-12 shadow-xl border-white/40">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d95000] to-[#ffb43f] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_white]" />
            </div>
            <span className="text-xl font-black tracking-tighter text-[#3b4044]">Akari</span>
          </Link>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-bold text-[#3b4044]/40">
            <Link href="/" className="hover:text-[#3b4044] transition-colors tracking-tight">
              Home
            </Link>
            <Link
              href="/deposit"
              className="hover:text-[#3b4044] transition-colors tracking-tight"
            >
              Yield
            </Link>
            <Link
              href="/swap"
              className="hover:text-[#3b4044] transition-colors tracking-tight"
            >
              Swap
            </Link>
            <a 
              href="https://github.com/akari-finance" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#3b4044] transition-colors tracking-tight"
            >
              Docs
            </a>
          </div>

          {/* Badge */}
          <div className="flex items-center gap-3 text-[10px] font-black text-[#3b4044]/30 uppercase tracking-[0.2em] bg-white/30 px-5 py-2.5 rounded-full border border-white/50">
            <span>Built on Solana</span>
            <span className="text-[#3b4044]/15">•</span>
            <span>Kamino & Jupiter</span>
          </div>
        </GlassCard>
      </div>
    </motion.footer>
  );
}
