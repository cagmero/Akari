"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Sidebar, TopBar } from "@/components/layout";
import { isWhitelisted } from "@/lib/merkle";
import { GlassCard, GlassButton } from "@/components/ui/Glass";
import { ShieldAlert, Copy, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, ready, user, logout } = usePrivy();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth Gate logic
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  if (!ready || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[#3b4044]/20 border-t-[#d95000] rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) return null;

  const walletAddress = user?.wallet?.address;
  const isAllowed = walletAddress ? isWhitelisted(walletAddress) : false;

  // KYC Overlay for un-whitelisted wallets
  if (!isAllowed && walletAddress) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f4ecde] p-4">
        <GlassCard variant="strong" className="max-w-lg w-full p-12 text-center flex flex-col items-center gap-8 shadow-3xl border-red-500/20">
          <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tighter text-[#3b4044]">KYC Verification Required</h2>
            <p className="text-[#3b4044]/60 font-bold leading-relaxed px-4">
              Your wallet is not registered with a verified entity. Provide this address to your treasury administrator:
            </p>
          </div>

          <div className="w-full relative group">
            <div className="bg-[#3b4044] text-white font-mono text-sm p-5 rounded-2xl break-all shadow-inner border border-white/10 pr-14">
              {walletAddress}
            </div>
            <button
               onClick={() => {
                 navigator.clipboard.writeText(walletAddress);
                 alert("Address copied!");
               }}
               className="absolute right-3 top-1/2 -translate-y-1/2 p-3 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
            >
              <Copy size={18} />
            </button>
          </div>

          <GlassButton
            variant="accent"
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-3 py-4 shadow-xl bg-red-500 hover:bg-red-600 font-black border-red-400"
          >
            <LogOut size={18} />
            Disconnect Wallet
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4ecde] overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Right Column (Topbar + Content) */}
      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto pt-24 pb-12 px-8">
           {children}
        </main>
      </div>
    </div>
  );
}
