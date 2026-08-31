export type ProposalType = "collab" | "holder";
/** MTK is the only unit the app uses — 1 MTK == 1 unit of price/goal/stake everywhere. */
export type Stablecoin = "MTK";
export type VoteKind = "like" | "dislike";

export type ProposalStatus =
  | "voting"
  | "passed"
  | "rejected"
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
}

export interface ConvertInput {
  stablecoin: Stablecoin;
  startDate: string;
  endDate: string;
}
