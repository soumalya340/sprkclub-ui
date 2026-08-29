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

// Match the app's warm-dark palette rather than RainbowKit's default blue.
const theme: Theme = {
  ...darkTheme({ borderRadius: "small", overlayBlur: "small" }),
  colors: {
    ...darkTheme().colors,
    accentColor: "#e4dfd3",
    accentColorForeground: "#0c0c0b",
    modalBackground: "#141412",
    modalBorder: "rgba(242, 239, 230, 0.12)",
    modalText: "#f2efe6",
    modalTextSecondary: "#9a9488",
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
