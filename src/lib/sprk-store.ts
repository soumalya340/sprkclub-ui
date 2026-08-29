import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  BACKER_ADDRESS,
  CREATOR_A,
  CREATOR_B,
  OPERATOR_ADDRESS,
  SEED_PROPOSALS,
} from "./seed";
import { isPassed, newId, randomAddress } from "./format";
import type {
  ConvertInput,
  CreateProposalInput,
  Proposal,
  VoteKind,
  WalletSlot,
} from "./types";

const FALLBACK_STORAGE: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
};

function getStorage(): Storage {
  if (typeof window === "undefined") return FALLBACK_STORAGE;
  return window.localStorage;
}

const COVERS = [
  "/covers/field-notes.jpg",
  "/covers/harbor.jpg",
  "/covers/atelier.jpg",
  "/covers/tape.jpg",
];

function pickCover(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash + title.charCodeAt(i) * (i + 1)) % 997;
  return COVERS[hash % COVERS.length] ?? COVERS[0];
}

function defaultWallets(you: string): WalletSlot[] {
  return [
    { id: "you", label: "Your wallet", address: you },
    { id: "backer", label: "Backer", address: BACKER_ADDRESS },
    { id: "operator", label: "Operator", address: OPERATOR_ADDRESS },
    { id: "creator-a", label: "Harbor creator", address: CREATOR_A },
    { id: "creator-b", label: "Atelier creator", address: CREATOR_B },
  ];
}

function deriveStatus(proposal: Proposal): Proposal["status"] {
  if (
    proposal.status === "disputed" ||
    proposal.status === "completed" ||
    proposal.status === "failed" ||
    proposal.status === "crowdfunding" ||
    proposal.status === "active"
  ) {
    return proposal.status;
  }
  if (isPassed(proposal)) return "passed";
  const total = proposal.likes + proposal.dislikes;
  if (total >= 3 && !isPassed(proposal)) return "rejected";
  return "voting";
}

export interface SprkState {
  hydrated: boolean;
  connected: boolean;
  wallets: WalletSlot[];
  activeWalletId: string;
  proposals: Proposal[];
  lastCreatedId: string | null;
  connect: () => void;
  disconnect: () => void;
  switchWallet: (id: string) => void;
  address: () => string;
  createProposal: (input: CreateProposalInput) => string;
  vote: (proposalId: string, kind: VoteKind) => void;
  convertProposal: (proposalId: string, input: ConvertInput) => void;
  stake: (proposalId: string) => void;
  mint: (proposalId: string) => void;
  withdraw: (proposalId: string) => void;
  dispute: (proposalId: string, reason: string) => void;
  claimback: (proposalId: string) => void;
  submitMilestone: (
    proposalId: string,
    input: { title: string; description: string; proof: string },
  ) => void;
  validateMilestone: (
    proposalId: string,
    milestoneId: string,
    approve: boolean,
  ) => void;
  resetDemo: () => void;
  setHydrated: (value: boolean) => void;
}

export const useSprkStore = create<SprkState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      connected: false,
      wallets: defaultWallets(randomAddress()),
      activeWalletId: "you",
      proposals: SEED_PROPOSALS,
      lastCreatedId: null,

      setHydrated: (value) => set({ hydrated: value }),

      address: () => {
        const { wallets, activeWalletId } = get();
        return wallets.find((w) => w.id === activeWalletId)?.address ?? "";
      },

      connect: () => set({ connected: true }),

      disconnect: () => set({ connected: false, activeWalletId: "you" }),

      switchWallet: (id) => {
        const exists = get().wallets.some((w) => w.id === id);
        if (exists) set({ activeWalletId: id, connected: true });
      },

      createProposal: (input) => {
        const creator = get().address();
        const id = newId("prop");
        const proposal: Proposal = {
          id,
          title: input.title.trim(),
          description: input.description.trim(),
          cover: pickCover(input.title),
          pricePerNft: input.pricePerNft,
          fundingGoal: input.fundingGoal,
          type: input.type,
          validTill: input.validTill,
          creator,
          createdAt: Date.now(),
          likes: 0,
          dislikes: 0,
          voters: {},
          status: "voting",
          stablecoin: "USDC",
          staked: false,
          totalFunding: 0,
          mintedCount: 0,
          backers: [],
          milestones: [],
          withdrawn: false,
        };
        set((state) => ({
          proposals: [proposal, ...state.proposals],
          lastCreatedId: id,
        }));
        return id;
      },

      vote: (proposalId, kind) => {
        const voter = get().address();
        set((state) => ({
          proposals: state.proposals.map((p) => {
            if (p.id !== proposalId) return p;
            if (p.status !== "voting" && p.status !== "passed" && p.status !== "rejected") {
              return p;
            }
            const prev = p.voters[voter];
            let likes = p.likes;
            let dislikes = p.dislikes;
            if (prev === kind) return p;
            if (prev === "like") likes -= 1;
            if (prev === "dislike") dislikes -= 1;
            if (kind === "like") likes += 1;
            if (kind === "dislike") dislikes += 1;
            const next: Proposal = {
              ...p,
              likes,
              dislikes,
              voters: { ...p.voters, [voter]: kind },
            };
            next.status = deriveStatus(next);
            return next;
          }),
        }));
      },

      convertProposal: (proposalId, input) => {
        const actor = get().address();
        set((state) => ({
          proposals: state.proposals.map((p) => {
            if (p.id !== proposalId) return p;
            if (p.creator.toLowerCase() !== actor.toLowerCase()) return p;
            if (!isPassed(p) && p.status !== "passed") return p;
            return {
              ...p,
              status: "crowdfunding" as const,
              stablecoin: input.stablecoin,
              startDate: input.startDate,
              endDate: input.endDate,
            };
          }),
        }));
      },

      stake: (proposalId) => {
        const actor = get().address();
        set((state) => ({
          proposals: state.proposals.map((p) => {
            if (p.id !== proposalId) return p;
            if (p.creator.toLowerCase() !== actor.toLowerCase()) return p;
            if (p.status !== "crowdfunding" || p.staked) return p;
            return { ...p, staked: true };
          }),
        }));
      },

      mint: (proposalId) => {
        const actor = get().address();
        set((state) => ({
          proposals: state.proposals.map((p) => {
            if (p.id !== proposalId) return p;
            if (!p.staked) return p;
            if (p.status !== "crowdfunding" && p.status !== "active") return p;
            if (p.totalFunding >= p.fundingGoal) return p;
            const amount = p.pricePerNft;
            const existing = p.backers.find(
              (b) => b.address.toLowerCase() === actor.toLowerCase(),
            );
            const backers = existing
              ? p.backers.map((b) =>
                  b.address.toLowerCase() === actor.toLowerCase()
                    ? { ...b, minted: b.minted + 1, amount: b.amount + amount }
                    : b,
                )
              : [...p.backers, { address: actor, minted: 1, amount }];
            const totalFunding = p.totalFunding + amount;
            const mintedCount = p.mintedCount + 1;
            const funded = totalFunding >= p.fundingGoal;
            return {
              ...p,
              backers,
              totalFunding,
              mintedCount,
              status: funded ? ("active" as const) : p.status,
            };
          }),
        }));
      },

      withdraw: (proposalId) => {
        const actor = get().address();
        set((state) => ({
          proposals: state.proposals.map((p) => {
            if (p.id !== proposalId) return p;
            if (p.creator.toLowerCase() !== actor.toLowerCase()) return p;
            const approved = p.milestones.some((m) => m.status === "approved");
            if (!approved || p.withdrawn) return p;
            return { ...p, withdrawn: true, status: "completed" as const };
          }),
        }));
      },

      dispute: (proposalId, reason) => {
        const actor = get().address();
        set((state) => ({
          proposals: state.proposals.map((p) => {
            if (p.id !== proposalId) return p;
            const isBacker = p.backers.some(
              (b) => b.address.toLowerCase() === actor.toLowerCase(),
            );
            if (!isBacker) return p;
            if (p.status !== "crowdfunding" && p.status !== "active") return p;
            return {
              ...p,
              status: "disputed" as const,
              disputedBy: actor,
              disputeReason: reason,
            };
          }),
        }));
      },

      claimback: (proposalId) => {
        const actor = get().address();
        set((state) => ({
          proposals: state.proposals.map((p) => {
            if (p.id !== proposalId) return p;
            if (p.status !== "disputed" && p.status !== "failed") return p;
            const backer = p.backers.find(
              (b) => b.address.toLowerCase() === actor.toLowerCase(),
            );
            if (!backer) return p;
            return {
              ...p,
              totalFunding: Math.max(0, p.totalFunding - backer.amount),
              mintedCount: Math.max(0, p.mintedCount - backer.minted),
              backers: p.backers.filter(
                (b) => b.address.toLowerCase() !== actor.toLowerCase(),
              ),
            };
          }),
        }));
      },

      submitMilestone: (proposalId, input) => {
        const actor = get().address();
        set((state) => ({
          proposals: state.proposals.map((p) => {
            if (p.id !== proposalId) return p;
            if (p.creator.toLowerCase() !== actor.toLowerCase()) return p;
            if (p.status !== "active") return p;
            const milestone = {
              id: newId("ms"),
              title: input.title.trim(),
              description: input.description.trim(),
              proof: input.proof.trim(),
              submittedAt: Date.now(),
              status: "submitted" as const,
            };
            return { ...p, milestones: [...p.milestones, milestone] };
          }),
        }));
      },

      validateMilestone: (proposalId, milestoneId, approve) => {
        const actor = get().address();
        if (actor.toLowerCase() !== OPERATOR_ADDRESS.toLowerCase()) return;
        set((state) => ({
          proposals: state.proposals.map((p) => {
            if (p.id !== proposalId) return p;
            return {
              ...p,
              milestones: p.milestones.map((m) =>
                m.id === milestoneId && m.status === "submitted"
                  ? {
                      ...m,
                      status: approve ? ("approved" as const) : ("rejected" as const),
                      reviewedAt: Date.now(),
                    }
                  : m,
              ),
            };
          }),
        }));
      },

      resetDemo: () => {
        const you =
          get().wallets.find((w) => w.id === "you")?.address ?? randomAddress();
        set({
          connected: false,
          wallets: defaultWallets(you),
          activeWalletId: "you",
          proposals: SEED_PROPOSALS.map((p) => ({
            ...p,
            backers: p.backers.map((b) => ({ ...b })),
            milestones: p.milestones.map((m) => ({ ...m })),
            voters: { ...p.voters },
          })),
          lastCreatedId: null,
        });
      },
    }),
    {
      name: "sprkclub-v1",
      storage: createJSONStorage(() => getStorage()),
      skipHydration: true,
      partialize: (state) => ({
        connected: state.connected,
        wallets: state.wallets,
        activeWalletId: state.activeWalletId,
        proposals: state.proposals,
        lastCreatedId: state.lastCreatedId,
      }),
    },
  ),
);

export function useAddress(): string {
  return useSprkStore((s) => {
    const slot = s.wallets.find((w) => w.id === s.activeWalletId);
    return s.connected ? (slot?.address ?? "") : "";
  });
}
