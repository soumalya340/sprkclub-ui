import "server-only";

import { formatUnits, type Address } from "viem";
import { MyTokenAbi } from "@/lib/chain/abi/MyToken";
import { contracts } from "@/lib/chain/config";
import { publicClient } from "@/lib/server/og-chain";

const ZERO = "0x0000000000000000000000000000000000000000";

/** Human SPRK balance for a wallet. Returns null when the token isn't deployed. */
export async function getSprkBalance(address: string): Promise<number | null> {
  if (!contracts.stablecoin || contracts.stablecoin === ZERO) return null;

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
