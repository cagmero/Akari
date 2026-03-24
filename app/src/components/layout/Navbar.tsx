"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { name: "Yield", href: "/deposit" },
  { name: "Swap", href: "/swap" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 w-full z-50 px-4 pt-4 md:px-6 md:pt-5"
    >
      <div className="liquid-glass-strong rounded-2xl px-5 py-3 md:px-8 md:py-3.5 flex items-center justify-between w-full max-w-6xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#d95000] to-[#ffb43f] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
            <div className="w-2 h-2 rounded-full bg-white/90" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#e3be81] to-[#d95000] border border-white/50" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#3b4044]">
            Akari
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1.5">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="relative px-5 py-2 rounded-xl text-sm font-semibold transition-colors duration-300"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-[#3b4044]/[0.07] border border-[#3b4044]/[0.08]"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    isActive
                      ? "text-[#3b4044]"
                      : "text-[#3b4044]/55 hover:text-[#3b4044]/85"
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/deposit"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#3b4044] to-[#4a5056] text-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Launch App
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-[#3b4044]/70 hover:bg-white/30 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="liquid-glass-strong rounded-2xl mt-2 p-4 flex flex-col gap-1 md:hidden w-full max-w-6xl mx-auto"
          >
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[#3b4044]/[0.07] text-[#3b4044]"
                      : "text-[#3b4044]/55 hover:bg-white/20"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/deposit"
              onClick={() => setMobileOpen(false)}
              className="mt-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#3b4044] to-[#4a5056] text-white text-center"
            >
              Launch App
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
