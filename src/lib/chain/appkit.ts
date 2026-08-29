import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { cookieStorage, createStorage } from "wagmi";
import { ogMainnet, ogTestnet } from "@/lib/chain/config";

/**
 * Reown AppKit (formerly WalletConnect) project id. Create a free one at
 * https://dashboard.reown.com and put it in .env.local as
 * NEXT_PUBLIC_REOWN_PROJECT_ID.
 *
 * Injected wallets (MetaMask, Rabby) work without it; the WalletConnect QR and
 * mobile-wallet options need a real id.
 */
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";

export const hasProjectId = projectId.length > 0;

export const networks = [ogTestnet, ogMainnet] as const;

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [...networks],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

/**
 * Holds the AppKit instance created in `Providers`. Kept here rather than using
 * the `useAppKit` hook because that hook throws when `createAppKit` was never
 * called — which is exactly the case when no project id is configured.
 */
type AppKitInstance = ReturnType<typeof import("@reown/appkit/react").createAppKit>;

let appKit: AppKitInstance | null = null;

export function setAppKit(instance: AppKitInstance) {
  appKit = instance;
}

export async function openAppKit(view?: "Account") {
  if (!appKit) return;
  await appKit.open(view ? { view } : undefined);
}
