import "server-only";

import { formatUnits, type Address } from "viem";
import { MyTokenAbi } from "@/lib/chain/abi/MyToken";
import { deploymentFor, ZERO, type OgNetwork } from "@/lib/chain/chains";
import { publicClientFor } from "@/lib/server/og-chain";

/** Human SPRK balance for a wallet. Returns null when the token isn't deployed. */
export async function getSprkBalance(
  address: string,
  network: OgNetwork,
): Promise<number | null> {
  const contracts = deploymentFor(network);
  if (!contracts.stablecoin || contracts.stablecoin === ZERO) return null;

  const publicClient = publicClientFor(network);
  const [raw, decimals] = await Promise.all([
    publicClient.readContract({
      address: contracts.stablecoin,
      abi: MyTokenAbi,
      functionName: "balanceOf",
      args: [address as Address],
    }),
    publicClient.readContract({
      address: contracts.stablecoin,
      abi: MyTokenAbi,
      functionName: "decimals",
    }),
  ]);

  return Number(formatUnits(raw as bigint, decimals as number));
}
