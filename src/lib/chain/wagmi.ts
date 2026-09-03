import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  okxWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { ogMainnet, ogTestnet } from "@/lib/chain/config";

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
        okxWallet,
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

/**
 * Both chains stay registered so the wallet dropdown can offer a mainnet/testnet
 * toggle (see connect-wallet.tsx). This only changes which chain the wallet is
 * connected to — it does NOT change which contracts the app reads/writes, which
 * stay pinned to `activeChain` / `contracts` in chain/config.ts. Switching the
 * wallet to testnet while the app targets mainnet contracts (or vice versa)
 * will make writes fail or hit the wrong deployment; the UI warns for this.
 */
export const wagmiConfig = createConfig({
  connectors,
  chains: [ogMainnet, ogTestnet],
  transports: {
    [ogMainnet.id]: http(),
    [ogTestnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
