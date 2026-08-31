"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { create } from "zustand";
import type {
  ConvertInput,
  CreateProposalInput,
  Proposal,
  VoteKind,
} from "./types";

/**
 * App state backed by Neon (via /api/proposals) and the real connected wallet.
 *
 * Mutations keep their original synchronous signatures so existing components
 * call them unchanged; internally each one POSTs to the API and refreshes the
 * proposal list. Server responses are authoritative — the store never invents
 * state locally.
 */

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export interface SprkState {
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  /** Lowercased address of the connected wallet, or "" when disconnected. */
  address: string;
  connected: boolean;
  proposals: Proposal[];
  lastCreatedId: string | null;

  setAccount: (address: string | undefined) => void;
  refresh: () => Promise<void>;

  createProposal: (input: CreateProposalInput) => Promise<string | null>;
  vote: (proposalId: string, kind: VoteKind) => Promise<boolean>;
  convertProposal: (proposalId: string, input: ConvertInput) => Promise<boolean>;
  stake: (proposalId: string) => Promise<boolean>;
  mint: (proposalId: string) => Promise<boolean>;
  withdraw: (proposalId: string) => Promise<boolean>;
  dispute: (proposalId: string, reason: string) => Promise<boolean>;
  claimback: (proposalId: string) => Promise<boolean>;
  submitMilestone: (
    proposalId: string,
    input: {
      title: string;
      description: string;
      proof?: string;
      rootHash?: string;
      chainTxHash?: string;
      milestoneIndex?: number;
    },
  ) => Promise<boolean>;
  validateMilestone: (
    proposalId: string,
    milestoneId: string,
    approve: boolean,
  ) => Promise<boolean>;
}

export const useSprkStore = create<SprkState>()((set, get) => {
  /**
   * Runs a mutation, then replaces the affected proposal with the server's
   * copy. Returns whether it succeeded so callers can gate optimistic UI
   * (toasts, redirects) on the real result instead of firing immediately.
   */
  async function act(proposalId: string, body: Record<string, unknown>): Promise<boolean> {
    const { address } = get();
    if (!address) {
      toast.error("Connect a wallet first");
      return false;
    }
    try {
      const { proposal } = await api<{ proposal: Proposal }>(
        `/api/proposals/${proposalId}/actions`,
        { method: "POST", body: JSON.stringify({ ...body, address }) },
      );
      set((s) => ({
        proposals: s.proposals.map((p) => (p.id === proposal.id ? proposal : p)),
      }));
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
      return false;
    }
  }

  return {
    hydrated: false,
    loading: false,
    error: null,
    address: "",
    connected: false,
    proposals: [],
    lastCreatedId: null,

    setAccount: (address) =>
      set({ address: address ? address.toLowerCase() : "", connected: Boolean(address) }),

    refresh: async () => {
      set({ loading: true });
      try {
        const { proposals } = await api<{ proposals: Proposal[] }>("/api/proposals");
        set({ proposals, error: null, hydrated: true });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : "Failed to load" });
      } finally {
        set({ loading: false });
      }
    },

    createProposal: async (input) => {
      const { address } = get();
      if (!address) {
        toast.error("Connect a wallet first");
        return null;
      }
      try {
        const { proposal } = await api<{ proposal: Proposal }>("/api/proposals", {
          method: "POST",
          body: JSON.stringify({ ...input, address }),
        });
        set((s) => ({
          proposals: [proposal, ...s.proposals],
          lastCreatedId: proposal.id,
        }));
        return proposal.id;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create");
        return null;
      }
    },

    vote: (proposalId, kind) => act(proposalId, { action: "vote", kind }),
    convertProposal: (proposalId, input) =>
      act(proposalId, { action: "convert", ...input }),
    stake: (proposalId) => act(proposalId, { action: "stake" }),
    mint: (proposalId) => act(proposalId, { action: "mint" }),
    withdraw: (proposalId) => act(proposalId, { action: "withdraw" }),
    dispute: (proposalId, reason) =>
      act(proposalId, { action: "dispute", reason }),
    claimback: (proposalId) => act(proposalId, { action: "claimback" }),
    submitMilestone: (proposalId, input) =>
      act(proposalId, { action: "submit-milestone", ...input }),
    validateMilestone: (proposalId, milestoneId, approve) =>
      act(proposalId, { action: "review-milestone", milestoneId, approve }),
  };
});

/** The connected wallet address, lowercased, or "" when no wallet is connected. */
export function useAddress(): string {
  return useSprkStore((s) => s.address);
}

/**
 * Keeps the store in sync with wagmi's account and loads proposals once.
 * Mounted by AppShell so every page gets it.
 */
export function useSprkSync() {
  const { address } = useAccount();
  const setAccount = useSprkStore((s) => s.setAccount);
  const refresh = useSprkStore((s) => s.refresh);
  const hydrated = useSprkStore((s) => s.hydrated);

  useEffect(() => {
    setAccount(address);
  }, [address, setAccount]);

  useEffect(() => {
    if (!hydrated) void refresh();
  }, [hydrated, refresh]);
}
