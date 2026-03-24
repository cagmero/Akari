import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Akari Treasury — Corporate DeFi on Solana",
  description:
    "Advanced corporate treasury management with compliant DeFi yield and FX swaps powered by Solana, Kamino Finance, and Jupiter.",
  keywords: ["Solana", "DeFi", "Treasury", "Kamino", "Jupiter", "Corporate"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased overflow-x-hidden bg-[#f4ecde] text-[#3b4044]">
        <Navbar />
        <main className="min-h-screen w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
