import { format } from "date-fns";
import type { Proposal, ProposalStatus, ProposalType, Stablecoin } from "./types";

export function truncateAddress(address: string, size = 4): string {
  if (!address) return "";
  if (address.length <= size * 2 + 2) return address;
  return `${address.slice(0, size + 2)}…${address.slice(-size)}`;
}

export function formatAmount(value: number, coin: Stablecoin = "SPRK"): string {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
  return `${formatted} ${coin}`;
}

export function formatDate(value: string | number): string {
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "d MMM yyyy");
}

export function typeLabel(type: ProposalType): string {
  switch (type) {
    case "event":
      return "Event";
    case "project":
      return "Project";
    case "creative-work":
      return "Creative Work";
    default:
      return type;
  }
}

/** Strip @ and profile URL prefixes so we store a clean handle. */
export function normalizeHandle(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed
    .replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]!
    .trim();
}

export function statusLabel(status: ProposalStatus): string {
  const map: Record<ProposalStatus, string> = {
    voting: "Voting",
    passed: "Passed",
    rejected: "Rejected",
    discarded: "Discarded",
    crowdfunding: "Campaign",
    active: "In delivery",
    disputed: "Disputed",
    completed: "Completed",
    failed: "Failed",
  };
  return map[status];
}

export function voteShare(proposal: Proposal): number {
  const total = proposal.likes + proposal.dislikes;
  if (total === 0) return 0;
  return Math.round((proposal.likes / total) * 100);
}

export function fundingShare(proposal: Proposal): number {
  if (proposal.fundingGoal <= 0) return 0;
  return Math.min(100, Math.round((proposal.totalFunding / proposal.fundingGoal) * 100));
}

export function stakeAmount(proposal: Proposal): number {
  return Math.round(proposal.fundingGoal * 0.2 * 100) / 100;
}

export function isPassed(proposal: Proposal): boolean {
  const total = proposal.likes + proposal.dislikes;
  return total >= 1 && voteShare(proposal) >= 55;
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

