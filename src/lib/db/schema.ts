import {
  bigint,
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Off-chain app state. On-chain truth (proof roots, audit roots, dispute status)
 * lives on 0G Chain — these tables hold the parts of the product that were
 * never on-chain: drafts, votes, backer records and milestone metadata.
 *
 * Wallet addresses are stored lowercased so lookups are case-insensitive.
 */

export const proposals = pgTable(
  "proposals",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    cover: text("cover").notNull(),
    pricePerNft: doublePrecision("price_per_nft").notNull(),
    fundingGoal: doublePrecision("funding_goal").notNull(),
    type: text("type").notNull(), // "event" | "project" | "creative-work"
    validTill: text("valid_till").notNull(),
    creator: text("creator").notNull(),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    status: text("status").notNull(),
    stablecoin: text("stablecoin").notNull(),
    startDate: text("start_date"),
    endDate: text("end_date"),
    staked: boolean("staked").notNull().default(false),
    totalFunding: doublePrecision("total_funding").notNull().default(0),
    mintedCount: integer("minted_count").notNull().default(0),
    withdrawn: boolean("withdrawn").notNull().default(false),
    disputedBy: text("disputed_by"),
    disputeReason: text("dispute_reason"),
    /** Deployed SprkClub contract address, once the proposal goes on-chain. */
    contractAddress: text("contract_address"),
    /** 0G Chain deployment this proposal's contract/txs belong to. */
    network: text("network").notNull().default("mainnet"),
    projectTwitter: text("project_twitter"),
    creatorTwitter: text("creator_twitter"),
    projectInstagram: text("project_instagram"),
    creatorInstagram: text("creator_instagram"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("proposals_creator_idx").on(t.creator)],
);

export const votes = pgTable(
  "votes",
  {
    proposalId: text("proposal_id")
      .notNull()
      .references(() => proposals.id, { onDelete: "cascade" }),
    voter: text("voter").notNull(),
    kind: text("kind").notNull(), // "like" | "dislike"
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  // One vote per wallet per proposal; re-voting updates the row.
  (t) => [primaryKey({ columns: [t.proposalId, t.voter] })],
);

export const backers = pgTable(
  "backers",
  {
    proposalId: text("proposal_id")
      .notNull()
      .references(() => proposals.id, { onDelete: "cascade" }),
    address: text("address").notNull(),
    minted: integer("minted").notNull().default(0),
    amount: doublePrecision("amount").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.proposalId, t.address] })],
);

export const milestones = pgTable(
  "milestones",
  {
    id: text("id").primaryKey(),
    proposalId: text("proposal_id")
      .notNull()
      .references(() => proposals.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    /** Legacy free-text proof link, kept for rows created before 0G wiring. */
    proof: text("proof").notNull().default(""),
    /** 0G Storage Merkle root, when the proof went through the 0G pipeline. */
    rootHash: text("root_hash"),
    /** 0G Chain tx that recorded the root via submitMileStoneProof. */
    chainTxHash: text("chain_tx_hash"),
    /** On-chain milestone index the root was recorded under. */
    milestoneIndex: integer("milestone_index"),
    status: text("status").notNull().default("submitted"),
    submittedAt: bigint("submitted_at", { mode: "number" }).notNull(),
    reviewedAt: bigint("reviewed_at", { mode: "number" }),
    reviewedBy: text("reviewed_by"),
    meta: jsonb("meta"),
  },
  (t) => [index("milestones_proposal_idx").on(t.proposalId)],
);

export type ProposalRow = typeof proposals.$inferSelect;
export type VoteRow = typeof votes.$inferSelect;
export type BackerRow = typeof backers.$inferSelect;
export type MilestoneRow = typeof milestones.$inferSelect;
