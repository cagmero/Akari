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
          <Link href="/" className="flex flex-col items-center group transition-all duration-300">
            <img 
              src="/akari_icon_logo.svg" 
              alt="Akari Icon" 
              className="h-16 object-contain transition-transform duration-500 group-hover:scale-110"
            />
            <img 
              src="/akari_english_logo.svg" 
              alt="Akari" 
              className="h-8 object-contain -mt-2"
            />
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

        </GlassCard>
      </div>
    </motion.footer>
  );
}
