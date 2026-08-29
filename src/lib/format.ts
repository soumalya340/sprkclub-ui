import { format } from "date-fns";
import type { Proposal, ProposalStatus, ProposalType, Stablecoin } from "./types";

export function truncateAddress(address: string, size = 4): string {
  if (!address) return "";
  if (address.length <= size * 2 + 2) return address;
  return `${address.slice(0, size + 2)}…${address.slice(-size)}`;
}

export function formatAmount(value: number, coin: Stablecoin = "USDC"): string {
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
  return type === "collab" ? "Sprkclub Collab" : "Sprkclub Holder";
}

export function statusLabel(status: ProposalStatus): string {
  const map: Record<ProposalStatus, string> = {
    voting: "Voting",
    passed: "Passed",
    rejected: "Rejected",
    crowdfunding: "Crowdfunding",
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

export function randomAddress(): string {
  const bytes = new Uint8Array(20);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 20; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}
