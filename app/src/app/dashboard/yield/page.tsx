"use client";

import dynamic from "next/dynamic";
import { ShieldCheck } from "lucide-react";

// Dynamically import the dashboard with SSR disabled to prevent 
// @orca-so/whirlpools-core (WASM) from exploding during SSR.
const YieldDashboardContent = dynamic(
  () => import("@/components/dashboard/YieldDashboardContent"),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-[#d95000]/20 border-t-[#d95000] rounded-full animate-spin" />
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#3b4044]/40">
           <ShieldCheck className="w-4 h-4" />
           Initializing Secure CPI Engine
        </div>
      </div>
    )
  }
);

export default function YieldPage() {
  return <YieldDashboardContent />;
}
