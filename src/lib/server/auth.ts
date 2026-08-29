import "server-only";

import { isAddress } from "viem";

/**
 * Every mutating route is attributed to a wallet address supplied by the client.
 *
 * This validates the shape only — it does not prove ownership of the key. The
 * actions these routes guard are off-chain bookkeeping (drafts, votes, backer
 * records); everything that moves value or unlocks funds is enforced on-chain by
 * SprkClub's `onlyProposalCreator` / `onlyOperator` modifiers, which a forged
 * address here cannot bypass. Add a SIWE signature check before treating this
 * layer as an authorization boundary in its own right.
 */
export function requireAddress(value: unknown): string {
  if (typeof value !== "string" || !isAddress(value)) {
    throw new Error("A connected wallet address is required");
  }
  return value.toLowerCase();
}
