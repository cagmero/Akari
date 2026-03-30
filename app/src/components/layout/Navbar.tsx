"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X, Copy, LogOut } from "lucide-react";
import { cn } from "@/components/ui/Glass";
import { usePrivy } from "@privy-io/react-auth";

const links = [
  { name: "Pool", href: "/dashboard/pool" },
  { name: "Swap", href: "/dashboard/fx" },
  { name: "Yield", href: "/dashboard/yield" },
  { name: "Admin", href: "/admin" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, logout, authenticated, user } = usePrivy();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 w-full z-50 px-4 pt-6 md:px-8 md:pt-8 pointer-events-none"
    >
      <div className="container-wide flex justify-center">
        <div className="liquid-glass-strong rounded-[1.5rem] px-8 py-3 md:px-10 md:py-4 flex items-center justify-between w-full max-w-6xl shadow-2xl pointer-events-auto">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-center group transition-all duration-300 -my-4 relative z-10">
            <img
              src="/akari_icon_logo.svg"
              alt="Akari Icon"
              className="w-16 h-16 object-contain transition-transform duration-500 group-hover:scale-110"
            />
            <img
              src="/akari_english_logo.svg"
              alt="Akari"
              className="h-8 object-contain -mt-4.5"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-[#3b4044]/[0.08] border border-[#3b4044]/[0.05]"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 transition-colors duration-300",
                      isActive
                        ? "text-[#3b4044]"
                        : "text-[#3b4044]/45 hover:text-[#3b4044]/80"
                    )}
                  >
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-6">
            {!authenticated ? (
              <button
                onClick={() => login()}
                className="bg-[#3b4044] text-white rounded-2xl px-6 py-3.5 text-[13px] font-black uppercase tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 pointer-events-auto"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-[#3b4044]/5 border border-[#3b4044]/10 rounded-2xl px-4 py-2 pointer-events-auto group relative">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3b4044]/40">Wallet</span>
                  <span className="text-sm font-bold text-[#3b4044]">
                    {user?.wallet?.address?.slice(0, 4)}...{user?.wallet?.address?.slice(-4)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={() => {
                      if (user?.wallet?.address) {
                        navigator.clipboard.writeText(user.wallet.address);
                        alert("Address copied!");
                      }
                    }}
                    className="p-2 hover:bg-[#3b4044]/5 rounded-lg text-[#3b4044]/60 hover:text-[#3b4044] transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                  <button 
                    onClick={() => logout()}
                    className="p-2 hover:bg-red-500/5 rounded-lg text-red-500/60 hover:text-red-500 transition-colors"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl text-[#3b4044]/80 hover:bg-[#3b4044]/5 transition-colors pointer-events-auto"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="container-wide mt-3 md:hidden">
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="liquid-glass-strong rounded-[2rem] p-5 flex flex-col gap-2 w-full max-w-5xl mx-auto shadow-2xl pointer-events-auto"
            >
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-6 py-4 rounded-2xl text-base font-bold transition-all",
                      isActive
                        ? "bg-[#3b4044]/[0.08] text-[#3b4044]"
                        : "text-[#3b4044]/50 hover:bg-white/40"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
              {!authenticated ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    login();
                  }}
                  className="mt-2 px-6 py-4 rounded-2xl text-base font-bold bg-[#3b4044] text-white text-center shadow-lg"
                >
                  Connect Wallet
                </button>
              ) : (
               <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="mt-2 px-6 py-4 rounded-2xl text-base font-bold bg-red-500 text-white text-center shadow-lg"
                >
                  Logout
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
