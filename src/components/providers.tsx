"use client";

import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { activeChain, ogMainnet, ogTestnet } from "@/lib/chain/config";
import {
  hasProjectId,
  projectId,
  setAppKit,
  wagmiAdapter,
  wagmiConfig,
} from "@/lib/chain/appkit";

// createAppKit registers the <appkit-button> web component and the modal. It
// must run once at module scope, before any component renders one.
if (hasProjectId) {
  setAppKit(
    createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [ogTestnet, ogMainnet],
    defaultNetwork: activeChain,
    metadata: {
      name: "Sprkclub",
      description: "A DAO + NFT where people make their dreams real.",
      url: "https://sprkclub.example",
      icons: ["https://sprkclub.example/favicon.svg"],
    },
    features: { analytics: false, email: false, socials: false },
    // Coinbase Smart Wallet drags in x402/CDP packages with optional deps that
    // do not resolve in this bundle; injected + WalletConnect cover our users.
    enableCoinbase: false,
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#e4dfd3",
      "--w3m-border-radius-master": "2px",
    },
    }),
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 10_000, retry: 1 } },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
