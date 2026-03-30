"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

export default function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const solanaConnectors = toSolanaWalletConnectors({
    shouldAutoConnect: true,
  });

  return (
    <PrivyProvider
      appId="cmncckp2e00xk0dkzgcc3zk5v"
      config={{
        appearance: {
          accentColor: "#d95000",
          theme: "#f4ecde",
          showWalletLoginFirst: true,
        },
        solana: {
          // Default devnet config
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
