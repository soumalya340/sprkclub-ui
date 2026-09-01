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
import { activeChain } from "@/lib/chain/config";
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

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 10_000, retry: 1 } },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme} initialChain={activeChain} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
