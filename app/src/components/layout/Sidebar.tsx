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
  Copy
} from "lucide-react";
import { cn } from "@/components/ui/Glass";
import { usePrivy } from "@privy-io/react-auth";

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

  const walletAddress = user?.wallet?.address || "Disconnected";

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

      {/* Pinned Bottom */}
      <div className="p-4 space-y-4 border-t border-[#3b4044]/5">
        <div className="bg-[#3b4044]/5 border border-[#3b4044]/10 rounded-[1.5rem] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#3b4044]/40">Wallet</span>
              <span className="text-xs font-black text-[#3b4044] tabular-nums">
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </span>
            </div>
            <button 
                onClick={() => {
                   navigator.clipboard.writeText(walletAddress);
                   alert("Address copied!");
                }}
                className="p-2 hover:bg-[#3b4044]/5 rounded-lg text-[#3b4044]/30 hover:text-[#3b4044] transition-all"
            >
              <Copy size={14} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-600 uppercase tracking-widest">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               Devnet
             </div>
             <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#3b4044]/5 border border-[#3b4044]/10 rounded-lg text-[9px] font-black text-[#3b4044]/40 uppercase tracking-widest">
               <ShieldCheck size={10} />
               Fireblocks
             </div>
          </div>
        </div>

        <button 
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-red-500/60 hover:text-red-600 hover:bg-red-500/5 transition-all transition-all duration-300 pointer-events-auto"
        >
          <LogOut size={16} />
          Disconnect
        </button>
      </div>
    </aside>
  );
}
