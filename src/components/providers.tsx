"use client";

import {
  RainbowKitProvider,
  darkTheme,
  type Theme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import type { OgNetwork } from "@/lib/chain/chains";
import { chainFor } from "@/lib/chain/network";
import { NetworkProvider } from "@/lib/chain/network-context";
import { wagmiConfig } from "@/lib/chain/wagmi";

// Match the app's sand palette (hue 286.25) rather than RainbowKit's default blue.
const theme: Theme = {
  ...darkTheme({ borderRadius: "small", overlayBlur: "small" }),
  colors: {
    ...darkTheme().colors,
    accentColor: "#e6e6ea",
    accentColorForeground: "#111112",
    modalBackground: "#29292a",
    modalBorder: "rgba(249, 249, 251, 0.12)",
    modalText: "#f9f9fb",
    modalTextSecondary: "#9c9ca4",
  },
};

export function Providers({
  initialNetwork,
  children,
}: {
  initialNetwork: OgNetwork;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 10_000, retry: 1 } },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={theme}
          initialChain={chainFor(initialNetwork)}
          modalSize="compact"
        >
          <NetworkProvider initialNetwork={initialNetwork}>
            {children}
          </NetworkProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
