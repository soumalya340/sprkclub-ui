import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { ogMainnet, ogTestnet } from "@/lib/chain/config";

/**
 * Injected-only connector (MetaMask, Rabby, …). 0G is an EVM L1, so any injected
 * wallet works once the chain is added — wagmi prompts for that automatically.
 */
export const wagmiConfig = createConfig({
  chains: [ogTestnet, ogMainnet],
  connectors: [injected()],
  transports: {
    [ogTestnet.id]: http(),
    [ogMainnet.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
