import type { Metadata } from "next";
import "./globals.css";
import PrivyProviderWrapper from "@/components/PrivyProviderWrapper";

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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased overflow-x-hidden bg-[#f4ecde] text-[#3b4044]">
        <PrivyProviderWrapper>
          <main className="min-h-screen w-full">{children}</main>
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}
