import { connectorsForWallets, type Wallet } from "@rainbow-me/rainbowkit";
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

const OKX_ICON =
  "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2028%2028%22%3E%3Cpath%20fill%3D%22%23000%22%20d%3D%22M0%200h28v28H0z%22%2F%3E%3Cpath%20fill%3D%22%23fff%22%20fill-rule%3D%22evenodd%22%20d%3D%22M10.819%205.556H5.93a.376.376%200%200%200-.375.375v4.888c0%20.207.168.375.375.375h4.888a.376.376%200%200%200%20.375-.376V5.932a.376.376%200%200%200-.376-.375Zm5.64%205.638h-4.886a.376.376%200%200%200-.376.376v4.887c0%20.208.168.376.376.376h4.887a.376.376%200%200%200%20.376-.375V11.57a.376.376%200%200%200-.376-.377Zm.75-5.638h4.887c.208%200%20.376.168.376.375v4.888a.376.376%200%200%201-.376.375H17.21a.376.376%200%200%201-.376-.376V5.933c0-.208.169-.376.376-.376Zm-6.39%2011.277H5.93a.376.376%200%200%200-.375.376v4.887c0%20.208.168.376.375.376h4.888a.376.376%200%200%200%20.375-.376V17.21a.376.376%200%200%200-.376-.376Zm6.39%200h4.887c.208%200%20.376.169.376.376v4.887a.376.376%200%200%201-.376.376H17.21a.376.376%200%200%201-.376-.376V17.21c0-.207.169-.376.376-.376Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E";

const okxInjected = (): Wallet => {
  return {
    id: "okx-injected",
    name: "OKX Wallet",
    // Inlined rather than reused from RainbowKit's okxWallet(), which throws
    // outright when projectId is empty.
    iconUrl: OKX_ICON,
    iconBackground: "#000",
    installed:
      typeof window !== "undefined" &&
      Boolean((window as OkxProviderWindow).okxwallet),
    downloadUrls: { browserExtension: "https://www.okx.com/web3" },
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
 * toggle (see connect-wallet.tsx). App contracts follow the `og-network` cookie
 * via NetworkProvider / getNetwork(); the wallet should match that chain or the
 * UI shows a wrong-chain warning.
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
