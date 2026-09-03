import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { ogMainnet } from "@/lib/chain/config";

/**
 * WalletConnect project id. Create a free one at https://cloud.walletconnect.com
 * and set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local.
 *
 * Injected wallets (MetaMask, Rabby) work without it; the WalletConnect QR and
 * mobile-wallet options need a real id.
 */
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const hasProjectId = projectId.length > 0;

/**
 * The wallet list is explicit rather than `getDefaultConfig`'s: that bundles
 * Coinbase Smart Wallet, which pulls in optional `@x402/*` payment packages
 * that aren't installed and break the build. 0G is a plain EVM L1, so the
 * injected + WalletConnect options below cover it.
 */
const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        injectedWallet,
        metaMaskWallet,
        rabbyWallet,
        rainbowWallet,
        trustWallet,
        ...(hasProjectId ? [walletConnectWallet] : []),
      ],
    },
    { groupName: "More", wallets: [safeWallet] },
  ],
  {
    appName: "Sprkclub",
    projectId: projectId || "sprkclub-local-dev",
  },
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [ogMainnet],
  transports: {
    [ogMainnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
