import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "./client";
import { backers, milestones, proposals, votes } from "./schema";
import type {
  Backer,
  ConvertInput,
  CreateProposalInput,
  Milestone,
  Proposal,
  ProposalStatus,
  VoteKind,
} from "@/lib/types";

/** Addresses are stored lowercased so lookups never depend on checksum casing. */
export const norm = (address: string) => address.trim().toLowerCase();

type Rows = {
  proposal: typeof proposals.$inferSelect;
  votes: (typeof votes.$inferSelect)[];
  backers: (typeof backers.$inferSelect)[];
  milestones: (typeof milestones.$inferSelect)[];
};

function toProposal({ proposal, votes: v, backers: b, milestones: m }: Rows): Proposal {
  const voters: Record<string, VoteKind> = {};
  let likes = 0;
  let dislikes = 0;

  for (const row of v) {
    voters[row.voter] = row.kind as VoteKind;
    if (row.kind === "like") likes++;
    else dislikes++;
  }

  return {
    id: proposal.id,
    title: proposal.title,
    description: proposal.description,
    cover: proposal.cover,
    pricePerNft: proposal.pricePerNft,
    fundingGoal: proposal.fundingGoal,
    type: proposal.type as Proposal["type"],
    validTill: proposal.validTill,
    creator: proposal.creator,
    createdAt: Number(proposal.createdAt),
    likes,
    dislikes,
    voters,
    status: proposal.status as ProposalStatus,
    stablecoin: proposal.stablecoin as Proposal["stablecoin"],
    startDate: proposal.startDate ?? undefined,
    endDate: proposal.endDate ?? undefined,
    staked: proposal.staked,
    totalFunding: proposal.totalFunding,
    mintedCount: proposal.mintedCount,
    backers: b.map(
      (row): Backer => ({
        address: row.address,
        minted: row.minted,
        amount: row.amount,
      }),
    ),
    milestones: m
      .slice()
      .sort((x, y) => Number(x.submittedAt) - Number(y.submittedAt))
      .map(
        (row): Milestone => ({
          id: row.id,
          title: row.title,
          description: row.description,
          proof: row.rootHash ?? row.proof,
          submittedAt: Number(row.submittedAt),
          reviewedAt: row.reviewedAt ? Number(row.reviewedAt) : undefined,
          status: row.status as Milestone["status"],
        }),
      ),
    disputedBy: proposal.disputedBy ?? undefined,
    disputeReason: proposal.disputeReason ?? undefined,
    withdrawn: proposal.withdrawn,
    contractAddress: proposal.contractAddress ?? undefined,
    projectTwitter: proposal.projectTwitter ?? undefined,
    creatorTwitter: proposal.creatorTwitter ?? undefined,
    projectInstagram: proposal.projectInstagram ?? undefined,
    creatorInstagram: proposal.creatorInstagram ?? undefined,
  };
}

/** Every proposal with its votes, backers and milestones joined in. */
export async function listProposals(): Promise<Proposal[]> {
  const [p, v, b, m] = await Promise.all([
    db.select().from(proposals),
    db.select().from(votes),
    db.select().from(backers),
    db.select().from(milestones),
  ]);

  const byProposal = <T extends { proposalId: string }>(rows: T[]) => {
    const map = new Map<string, T[]>();
    for (const row of rows) {
      const list = map.get(row.proposalId);
      if (list) list.push(row);
      else map.set(row.proposalId, [row]);
    }
    return map;
  };

  const vMap = byProposal(v);
  const bMap = byProposal(b);
  const mMap = byProposal(m);

  return p
    .map((proposal) =>
      toProposal({
        proposal,
        votes: vMap.get(proposal.id) ?? [],
        backers: bMap.get(proposal.id) ?? [],
        milestones: mMap.get(proposal.id) ?? [],
      }),
    )
    .sort((a, z) => z.createdAt - a.createdAt);
}

export async function getProposal(id: string): Promise<Proposal | null> {
  const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
  if (!proposal) return null;

  const [v, b, m] = await Promise.all([
    db.select().from(votes).where(eq(votes.proposalId, id)),
    db.select().from(backers).where(eq(backers.proposalId, id)),
    db.select().from(milestones).where(eq(milestones.proposalId, id)),
  ]);

  return toProposal({ proposal, votes: v, backers: b, milestones: m });
}

const COVERS = [
  "/covers/field-notes.jpg",
  "/covers/harbor.jpg",
  "/covers/atelier.jpg",
  "/covers/tape.jpg",
];

function pickCover(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash + title.charCodeAt(i) * (i + 1)) % 997;
  }
  return COVERS[hash % COVERS.length]!;
}

export async function createProposal(
  input: CreateProposalInput,
  creator: string,
): Promise<Proposal> {
  const id = `prop-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  await db.insert(proposals).values({
    id,
    title: input.title.trim(),
    description: input.description.trim(),
    cover: input.cover?.trim() || pickCover(input.title),
    pricePerNft: input.pricePerNft,
    fundingGoal: input.fundingGoal,
    type: input.type,
    validTill: input.validTill,
    creator: norm(creator),
    createdAt: Date.now(),
    status: "voting",
    stablecoin: "SPRK",
    projectTwitter: input.projectTwitter || null,
    creatorTwitter: input.creatorTwitter || null,
    projectInstagram: input.projectInstagram || null,
    creatorInstagram: input.creatorInstagram || null,
  });

  return (await getProposal(id))!;
}

/**
 * Upserts a vote — a wallet re-voting replaces its previous choice — then
 * re-tallies and flips a "voting" proposal to "passed" once support reaches
 * 55% (matching the client-side isPassed() threshold).
 */
export async function castVote(proposalId: string, voter: string, kind: VoteKind) {
  await db
    .insert(votes)
    .values({ proposalId, voter: norm(voter), kind })
    .onConflictDoUpdate({
      target: [votes.proposalId, votes.voter],
      set: { kind },
    });

  const rows = await db
    .select({ kind: votes.kind })
    .from(votes)
    .where(eq(votes.proposalId, proposalId));

  const likes = rows.filter((r) => r.kind === "like").length;
  const total = rows.length;
  const share = total > 0 ? (likes / total) * 100 : 0;

  if (total >= 1 && share >= 55) {
    await db
      .update(proposals)
      .set({ status: "passed", updatedAt: new Date() })
      .where(and(eq(proposals.id, proposalId), eq(proposals.status, "voting")));
  }
}

export async function convertProposal(proposalId: string, input: ConvertInput) {
  await db
    .update(proposals)
    .set({
      stablecoin: input.stablecoin,
      startDate: input.startDate,
      endDate: input.endDate,
      status: "crowdfunding",
      updatedAt: new Date(),
    })
    .where(eq(proposals.id, proposalId));
}

export async function setStaked(proposalId: string) {
  await db
    .update(proposals)
    .set({ staked: true, updatedAt: new Date() })
    .where(eq(proposals.id, proposalId));
}

/** Records a mint and advances funding; flips to "active" once the goal is met. */
export async function recordMint(proposalId: string, address: string) {
  const proposal = await getProposal(proposalId);
  if (!proposal) throw new Error("Proposal not found");

  const buyer = norm(address);
  const amount = proposal.pricePerNft;

  await db
    .insert(backers)
    .values({ proposalId, address: buyer, minted: 1, amount })
    .onConflictDoUpdate({
      target: [backers.proposalId, backers.address],
      set: {
        minted: sql`${backers.minted} + 1`,
        amount: sql`${backers.amount} + ${amount}`,
        updatedAt: new Date(),
      },
    });

  const totalFunding = proposal.totalFunding + amount;
  const goalReached = totalFunding >= proposal.fundingGoal;

  await db
    .update(proposals)
    .set({
      totalFunding,
      mintedCount: proposal.mintedCount + 1,
      status: goalReached ? "active" : proposal.status,
      updatedAt: new Date(),
    })
    .where(eq(proposals.id, proposalId));
}

export async function setWithdrawn(proposalId: string) {
  await db
    .update(proposals)
    .set({ withdrawn: true, updatedAt: new Date() })
    .where(eq(proposals.id, proposalId));
}

export async function disputeProposal(
  proposalId: string,
  by: string,
  reason: string,
) {
  await db
    .update(proposals)
    .set({
      status: "disputed",
      disputedBy: norm(by),
      disputeReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(proposals.id, proposalId));
}

export async function setStatus(proposalId: string, status: ProposalStatus) {
  await db
    .update(proposals)
    .set({ status, updatedAt: new Date() })
    .where(eq(proposals.id, proposalId));
}

export async function submitMilestone(
  proposalId: string,
  input: {
    title: string;
    description: string;
    proof?: string;
    rootHash?: string;
    chainTxHash?: string;
    milestoneIndex?: number;
  },
): Promise<Milestone> {
  const id = `ms-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  await db.insert(milestones).values({
    id,
    proposalId,
    title: input.title.trim(),
    description: input.description.trim(),
    proof: input.proof ?? "",
    rootHash: input.rootHash ?? null,
    chainTxHash: input.chainTxHash ?? null,
    milestoneIndex: input.milestoneIndex ?? null,
    status: "submitted",
    submittedAt: Date.now(),
  });

  return {
    id,
    title: input.title.trim(),
    description: input.description.trim(),
    proof: input.rootHash ?? input.proof ?? "",
    submittedAt: Date.now(),
    status: "submitted",
  };
}

export async function reviewMilestone(
  proposalId: string,
  milestoneId: string,
  approve: boolean,
  reviewer: string,
) {
  await db
    .update(milestones)
    .set({
      status: approve ? "approved" : "rejected",
      reviewedAt: Date.now(),
      reviewedBy: norm(reviewer),
    })
    .where(
      and(eq(milestones.id, milestoneId), eq(milestones.proposalId, proposalId)),
    );
}
