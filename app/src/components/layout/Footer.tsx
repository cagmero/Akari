"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full px-4 pb-6 md:px-6 md:pb-8"
    >
      <div className="liquid-glass rounded-2xl w-full max-w-6xl mx-auto px-8 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d95000] to-[#ffb43f] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
          </div>
          <span className="text-base font-bold tracking-tight">Akari</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm font-medium text-[#3b4044]/50">
          <Link href="/" className="hover:text-[#3b4044] transition-colors">
            Home
          </Link>
          <Link
            href="/deposit"
            className="hover:text-[#3b4044] transition-colors"
          >
            Yield
          </Link>
          <Link
            href="/swap"
            className="hover:text-[#3b4044] transition-colors"
          >
            Swap
          </Link>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#3b4044]/40">
          <span>Built on Solana</span>
          <span className="text-[#3b4044]/20">•</span>
          <span>Powered by Kamino & Jupiter</span>
        </div>
      </div>
    </motion.footer>
  );
}
