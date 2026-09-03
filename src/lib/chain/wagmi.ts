import { connectorsForWallets, type Wallet } from "@rainbow-me/rainbowkit";
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
import { injected } from "wagmi/connectors";
import { ogMainnet, ogTestnet } from "@/lib/chain/config";

/**
 * WalletConnect project id. Create a free one at https://cloud.walletconnect.com
 * and set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local.
 *
 * Without a real id the WalletConnect relay rejects every subscription, so the
 * wallets that depend on it are dropped entirely rather than offered and left
 * to fail — an unusable QR option is worse than no QR option.
 */
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const hasProjectId = projectId.length > 0;

/**
 * OKX injects `window.okxwallet` alongside `window.ethereum`. RainbowKit's own
 * `okxWallet` only sniffs `window.ethereum.isOkxWallet`, which loses whenever
 * another extension (Rabby, MetaMask) claims that object first — it then falls
 * back to WalletConnect and dies without a project id. Targeting the dedicated
 * namespace keeps the extension path working no matter who won `window.ethereum`.
 */
type OkxProviderWindow = Window & { okxwallet?: unknown };

const okxInjected = (): Wallet => {
  // Reuse RainbowKit's own OKX branding; only the connector differs.
  const branding = okxWallet({ projectId });

  return {
    id: "okx-injected",
    name: branding.name,
    iconUrl: branding.iconUrl,
    iconBackground: branding.iconBackground,
    installed:
      typeof window !== "undefined" &&
      Boolean((window as OkxProviderWindow).okxwallet),
    downloadUrls: branding.downloadUrls,
    createConnector: (walletDetails) => {
      const connector = injected({
        target: () => ({
          id: "okx-injected",
          name: "OKX Wallet",
          provider: (window) =>
            (window as OkxProviderWindow | undefined)?.okxwallet as never,
        }),
      });
      // RainbowKit hands the connector its own metadata; wagmi's factory takes
      // only the wagmi config, so compose rather than pass walletDetails through.
      return (config) => ({ ...connector(config), ...walletDetails });
    },
  };
};

/**
 * The wallet list is explicit rather than `getDefaultConfig`'s: that bundles
 * Coinbase Smart Wallet, which pulls in optional `@x402/*` payment packages
 * that aren't installed and break the build. 0G is a plain EVM L1, so the
 * injected options below cover it.
 *
 * Everything outside `walletConnectBacked` talks to a browser extension and
 * needs no project id.
 */
const walletConnectBacked = [
  metaMaskWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
];

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        injectedWallet,
        okxInjected,
        rabbyWallet,
        ...(hasProjectId ? walletConnectBacked : []),
      ],
    },
    { groupName: "More", wallets: [safeWallet] },
  ],
  {
    appName: "Sprkclub",
    // Only ever a real id: the placeholder is what made the relay retry forever.
    projectId,
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
