import type { Proposal } from "./types";

/** Voting window from creation — after this the idea is discarded. */
export const PROPOSAL_VOTE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/** How long a discarded proposal stays visible to its creator. */
export const DISCARDED_VISIBLE_MS = 24 * 60 * 60 * 1000;

/** Wallet must hold more than this many SPRK to cast a vote. */
export const MIN_SPRK_TO_VOTE = 1;

export function proposalExpiresAt(createdAt: number): number {
  return createdAt + PROPOSAL_VOTE_WINDOW_MS;
}

export function proposalPurgeAt(createdAt: number): number {
  return createdAt + PROPOSAL_VOTE_WINDOW_MS + DISCARDED_VISIBLE_MS;
}

export function isVoteWindowExpired(
  proposal: Pick<Proposal, "createdAt" | "status">,
  now = Date.now(),
): boolean {
  if (proposal.status !== "voting") return false;
  return now >= proposalExpiresAt(proposal.createdAt);
}

export function msUntilDiscard(
  proposal: Pick<Proposal, "createdAt">,
  now = Date.now(),
): number {
  return Math.max(0, proposalExpiresAt(proposal.createdAt) - now);
}

/** Compact countdown for cards — e.g. "12d left", "5h left", "Expired". */
export function formatDiscardCountdown(
  proposal: Pick<Proposal, "createdAt" | "status">,
  now = Date.now(),
): string {
  if (proposal.status === "discarded") return "Discarded";
  const ms = msUntilDiscard(proposal, now);
  if (ms <= 0) return "Expired";

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (ms >= day) {
    const days = Math.ceil(ms / day);
    return `${days}d left`;
  }
  if (ms >= hour) {
    const hours = Math.ceil(ms / hour);
    return `${hours}h left`;
  }
  const mins = Math.max(1, Math.ceil(ms / minute));
  return `${mins}m left`;
}

/** Public explore lists — hide discarded and expired voting ideas. */
export function isPubliclyListed(proposal: Proposal, now = Date.now()): boolean {
  if (proposal.status === "discarded") return false;
  if (proposal.status === "voting" && now >= proposalExpiresAt(proposal.createdAt)) {
    return false;
  }
  return true;
}

/**
 * Creator dashboard — show discarded ideas until the 24h grace ends, then hide.
 */
export function isVisibleToCreator(proposal: Proposal, now = Date.now()): boolean {
  if (proposal.status !== "discarded") return true;
  return now < proposalPurgeAt(proposal.createdAt);
}

export function canVoteWithBalance(balance: number | null | undefined): boolean {
  if (balance == null || Number.isNaN(balance)) return false;
  return balance > MIN_SPRK_TO_VOTE;
}
