export type ProposalType = "collab" | "holder";
export type Stablecoin = "USDT" | "USDC" | "MATIC";
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
}

export interface WalletSlot {
  id: string;
  label: string;
  address: string;
}

export interface CreateProposalInput {
  title: string;
  description: string;
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
