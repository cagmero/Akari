"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Layers, 
  RefreshCw, 
  TrendingUp, 
  History,
  ShieldCheck,
  LogOut,
  Copy,
  ChevronUp,
  ExternalLink,
  User as UserIcon
} from "lucide-react";
import { cn } from "@/components/ui/Glass";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Overview", href: "/app", icon: LayoutDashboard },
  { name: "Pool", href: "/app/pool", icon: Layers },
  { name: "FX Markets", href: "/app/fx", icon: RefreshCw },
  { name: "Yield", href: "/app/yield", icon: TrendingUp },
  { name: "Audit Trail", href: "/app/audit", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = usePrivy();
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const walletAddress = user?.wallet?.address || "Disconnected";

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    alert("Address copied!");
  };

  return (
    <aside className="w-[240px] h-screen bg-white/40 border-r border-[#3b4044]/10 flex flex-col relative z-50 shrink-0 backdrop-blur-xl">
      {/* Brand */}
      <div className="p-8 pb-12">
        <Link href="/" className="flex flex-col items-center group transition-all duration-300">
          <img
            src="/akari_icon_logo.svg"
            alt="Akari Icon"
            className="w-16 h-16 object-contain transition-transform duration-500 group-hover:scale-110"
          />
          <img
            src="/akari_english_logo.svg"
            alt="Akari"
            className="h-8 object-contain -mt-4"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300",
                isActive
                  ? "bg-[#3b4044] text-white shadow-lg"
                  : "text-[#3b4044]/50 hover:bg-[#3b4044]/5 hover:text-[#3b4044]"
              )}
            >
              <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-white" : "text-[#3b4044]/30 group-hover:text-[#3b4044]/60")} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Account / Wallet Dropdown */}
      <div className="p-4 relative">
        <AnimatePresence>
          {isAccountOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-[calc(100%-8px)] left-4 right-4 bg-white/80 backdrop-blur-2xl border border-[#3b4044]/10 rounded-[2rem] p-3 shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex flex-col gap-1">
                <button 
                  onClick={copyAddress}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#3b4044]/60 hover:bg-[#3b4044]/5 hover:text-[#3b4044] transition-all"
                >
                  <Copy size={14} />
                  Copy Address
                </button>
                <a 
                  href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#3b4044]/60 hover:bg-[#3b4044]/5 hover:text-[#3b4044] transition-all text-left"
                >
                  <ExternalLink size={14} />
                  View Explorer
                </a>
                <div className="h-px bg-[#3b4044]/5 my-1 mx-2" />
                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:bg-red-500/5 hover:text-red-600 transition-all"
                >
                  <LogOut size={14} />
                  Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsAccountOpen(!isAccountOpen)}
          className={cn(
            "w-full bg-white/40 hover:bg-white/60 border border-[#3b4044]/10 rounded-[1.75rem] p-4 flex items-center justify-between transition-all duration-300 group shadow-sm",
            isAccountOpen && "bg-white/80 border-[#3b4044]/20 shadow-md ring-4 ring-[#3b4044]/[0.02]"
          )}
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#3b4044]/5 flex items-center justify-center border border-[#3b4044]/10 group-hover:scale-105 transition-transform">
                <UserIcon size={18} className="text-[#3b4044]/60" />
             </div>
             <div className="flex flex-col text-left">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#3b4044]/40">Active Institutional Wallet</span>
                <span className="text-xs font-black text-[#3b4044] tabular-nums">
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </span>
             </div>
          </div>
          <ChevronUp 
            size={16} 
            className={cn("text-[#3b4044]/20 transition-transform duration-500", isAccountOpen && "rotate-180")} 
          />
        </button>
      </div>
    </aside>
  );
}
