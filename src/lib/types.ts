/** What the campaign is funding — shown on Launch and badges. */
export type ProposalType = "event" | "project" | "creative-work";
/** SPRK is the only unit the app uses — 1 SPRK == 1 unit of price/goal/stake everywhere. */
export type Stablecoin = "SPRK";
export type VoteKind = "like" | "dislike";
/** Which 0G Chain deployment a proposal's on-chain data lives on. */
export type OgNetwork = "testnet" | "mainnet";

/** Social handles stored without a leading @. */
export interface ProposalSocials {
  projectTwitter?: string;
  creatorTwitter?: string;
  projectInstagram?: string;
  creatorInstagram?: string;
}

export type ProposalStatus =
  | "voting"
  | "passed"
  | "rejected"
  | "discarded"
  | "crowdfunding"
  | "active"
  | "disputed"
  | "completed"
  | "failed";

export type MilestoneStatus = "submitted" | "approved" | "rejected";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  proof: string;
  submittedAt: number;
  reviewedAt?: number;
  status: MilestoneStatus;
}

export interface Backer {
  address: string;
  minted: number;
  amount: number;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  cover: string;
  pricePerNft: number;
  fundingGoal: number;
  type: ProposalType;
  validTill: string;
  creator: string;
  createdAt: number;
  likes: number;
  dislikes: number;
  voters: Record<string, VoteKind>;
  status: ProposalStatus;
  stablecoin: Stablecoin;
  startDate?: string;
  endDate?: string;
  staked: boolean;
  totalFunding: number;
  mintedCount: number;
  backers: Backer[];
  milestones: Milestone[];
  disputedBy?: string;
  disputeReason?: string;
  withdrawn: boolean;
  /** Deployed SprkClub contract, once the proposal is live on 0G Chain. */
  contractAddress?: string;
  /** 0G Chain deployment this proposal's contract/txs belong to. */
  network: OgNetwork;
  projectTwitter?: string;
  creatorTwitter?: string;
  projectInstagram?: string;
  creatorInstagram?: string;
}

export interface CreateProposalInput {
  title: string;
  description: string;
  /** Uploaded cover image URL (Vercel Blob). Falls back to a stock cover when omitted. */
  cover?: string;
  pricePerNft: number;
  fundingGoal: number;
  type: ProposalType;
  validTill: string;
  projectTwitter?: string;
  creatorTwitter?: string;
  projectInstagram?: string;
  creatorInstagram?: string;
}

export interface ConvertInput {
  stablecoin: Stablecoin;
  startDate: string;
  endDate: string;
}
