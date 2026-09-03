import "server-only";

import { cookies } from "next/headers";
import { deploymentFor, type Deployment, type OgNetwork } from "@/lib/chain/chains";
import { chainFor, NETWORK_COOKIE, parseNetwork } from "@/lib/chain/network";

/**
 * The active network for this request, from the toggle's cookie. Falls back to
 * NEXT_PUBLIC_OG_NETWORK when the visitor has never toggled.
 *
 * Every server path that touches chain state — route handlers, server
 * components, DB queries — resolves the network through here so a single
 * request can never mix testnet and mainnet.
 */
export async function getNetwork(): Promise<OgNetwork> {
  const store = await cookies();
  return parseNetwork(store.get(NETWORK_COOKIE)?.value);
}

export type NetworkContext = {
  network: OgNetwork;
  chain: ReturnType<typeof chainFor>;
  contracts: Deployment;
};

export async function getNetworkContext(): Promise<NetworkContext> {
  const network = await getNetwork();
  return { network, chain: chainFor(network), contracts: deploymentFor(network) };
}
