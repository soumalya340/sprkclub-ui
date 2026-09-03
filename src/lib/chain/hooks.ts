"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { Address } from "viem";
import { waitForTransactionReceipt } from "@wagmi/core";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { SprkClubCollabAbi } from "@/lib/chain/abi/SprkClubCollab";
import { MyTokenAbi } from "@/lib/chain/abi/MyToken";
import {
  DISPUTE_WINDOW_SECONDS,
  MilestoneStatusOnChain,
} from "@/lib/chain/config";
import { useNetwork } from "@/lib/chain/network-context";
import { wagmiConfig } from "@/lib/chain/wagmi";
import type { Scorecard } from "@/lib/scorecard";

/**
 * Reads the live state of a deployed SprkClub Collab proposal.
 */
export function useProposalState(address: Address | undefined) {
  const enabled = Boolean(address);

  const { data, isLoading, refetch } = useReadContracts({
    allowFailure: true,
    contracts: address
      ? ([
          { address, abi: SprkClubCollabAbi, functionName: "proposalCreator" },
          { address, abi: SprkClubCollabAbi, functionName: "numberOfMileStones" },
          { address, abi: SprkClubCollabAbi, functionName: "pause" },
          { address, abi: SprkClubCollabAbi, functionName: "isProposalRejected" },
          { address, abi: SprkClubCollabAbi, functionName: "isCreatorStaked" },
          { address, abi: SprkClubCollabAbi, functionName: "fundsInReserve" },
          { address, abi: SprkClubCollabAbi, functionName: "crowdFundingGoal" },
          { address, abi: SprkClubCollabAbi, functionName: "disputeBond" },
          { address, abi: SprkClubCollabAbi, functionName: "relayer" },
        ] as const)
      : undefined,
    query: { enabled, refetchInterval: 15_000 },
  });

  return useMemo(() => {
    const value = <T,>(i: number): T | undefined =>
      data?.[i]?.status === "success" ? (data[i].result as T) : undefined;

    return {
      isLoading,
      refetch,
      creator: value<Address>(0),
      milestoneIndex: (() => {
        const raw = value<number | bigint>(1);
        return raw === undefined ? undefined : Number(raw);
      })(),
      paused: value<boolean>(2),
      rejected: value<boolean>(3),
      staked: value<boolean>(4),
      fundsInReserve: value<bigint>(5),
      fundingGoal: value<bigint>(6),
      disputeBond: value<bigint>(7),
      relayer: value<Address>(8),
    };
  }, [data, isLoading, refetch]);
}

/** Proof roots recorded on-chain for a milestone index (via API). */
export function useMilestoneProofs(address: Address | undefined, milestoneIndex = 0) {
  const { chain } = useNetwork();
  return useQuery({
    queryKey: ["milestone-proofs", chain.id, address, milestoneIndex],
    enabled: Boolean(address),
    refetchInterval: 20_000,
    queryFn: async (): Promise<string[]> => {
      const res = await fetch(`/api/milestones/${address}/${milestoneIndex}/proof`);
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load proofs");
      return (await res.json()).roots ?? [];
    },
  });
}

export function useAuditRoot(address: Address | undefined, milestoneIndex = 0) {
  const enabled = Boolean(address);
  const { data, isLoading, refetch } = useReadContracts({
    allowFailure: true,
    contracts: address
      ? ([
          {
            address,
            abi: SprkClubCollabAbi,
            functionName: "auditRootHash",
            args: [BigInt(milestoneIndex)],
          },
          {
            address,
            abi: SprkClubCollabAbi,
            functionName: "auditRecordedAt",
            args: [BigInt(milestoneIndex)],
          },
          {
            address,
            abi: SprkClubCollabAbi,
            functionName: "milestoneStatus",
            args: [BigInt(milestoneIndex)],
          },
        ] as const)
      : undefined,
    query: { enabled, refetchInterval: 15_000 },
  });

  return useMemo(() => {
    const value = <T,>(i: number): T | undefined =>
      data?.[i]?.status === "success" ? (data[i].result as T) : undefined;
    const auditRootHash = value<`0x${string}`>(0);
    const auditRecordedAt = value<bigint>(1);
    const statusRaw = value<number | bigint>(2);
    const status = statusRaw === undefined ? undefined : Number(statusRaw);
    const windowEnd =
      auditRecordedAt && auditRecordedAt > 0n
        ? Number(auditRecordedAt) + DISPUTE_WINDOW_SECONDS
        : undefined;

    return {
      isLoading,
      refetch,
      auditRootHash,
      auditRecordedAt,
      status,
      windowEnd,
      statusLabel: statusLabel(status),
    };
  }, [data, isLoading, refetch]);
}

export type ChallengeView = {
  challenger: Address;
  bond: bigint;
  voteEnd: bigint;
  votesForAlice: bigint;
  votesForBob: bigint;
  resolved: boolean;
};

export function useDisputeState(address: Address | undefined, milestoneIndex = 0) {
  const audit = useAuditRoot(address, milestoneIndex);
  const { data: challenge, refetch: refetchChallenge } = useReadContract({
    address,
    abi: SprkClubCollabAbi,
    functionName: "milestoneChallenge",
    args: [BigInt(milestoneIndex)],
    query: {
      enabled: Boolean(address) && audit.status === MilestoneStatusOnChain.Challenged,
      refetchInterval: 10_000,
    },
  });

  const challengeView: ChallengeView | undefined = useMemo(() => {
    if (!challenge) return undefined;
    const [challenger, bond, voteEnd, votesForAlice, votesForBob, resolved] =
      challenge as readonly [Address, bigint, bigint, bigint, bigint, boolean];
    if (challenger === "0x0000000000000000000000000000000000000000") return undefined;
    return { challenger, bond, voteEnd, votesForAlice, votesForBob, resolved };
  }, [challenge]);

  return {
    ...audit,
    challenge: challengeView,
    refetchAll: async () => {
      await Promise.all([audit.refetch(), refetchChallenge()]);
    },
  };
}

export function useCollabTicketBalance(address: Address | undefined) {
  const { address: wallet } = useAccount();
  return useReadContract({
    address,
    abi: SprkClubCollabAbi,
    functionName: "balanceOf",
    args: wallet ? [wallet] : undefined,
    query: { enabled: Boolean(address && wallet), refetchInterval: 20_000 },
  });
}

export function useHasVoted(address: Address | undefined, milestoneIndex = 0) {
  const { address: wallet } = useAccount();
  return useReadContract({
    address,
    abi: SprkClubCollabAbi,
    functionName: "hasVoted",
    args: wallet ? [BigInt(milestoneIndex), wallet] : undefined,
    query: { enabled: Boolean(address && wallet) },
  });
}

export type EvaluateResponse = {
  scorecard: Scorecard;
  auditRootHash: string;
  chainTxHash?: string;
  degraded?: boolean;
  error?: string;
};

export function useScorecard(address: Address | undefined, milestoneIndex = 0) {
  const { chain } = useNetwork();
  return useQuery({
    queryKey: ["milestone-scorecard", chain.id, address, milestoneIndex],
    enabled: Boolean(address),
    refetchInterval: 20_000,
    queryFn: async (): Promise<{
      status: number;
      auditRootHash: string;
      auditRecordedAt: string;
      disputeBond: string;
      scorecard: Scorecard | null;
    }> => {
      const res = await fetch(`/api/milestones/${address}/${milestoneIndex}/evaluate`);
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load scorecard");
      return res.json();
    },
  });
}

export function useRunEvaluate(address: Address | undefined, milestoneIndex = 0) {
  return useCallback(
    async (meta: {
      proposalTitle: string;
      proposalDescription: string;
      milestoneTitle?: string;
      milestoneAcceptance?: string;
      proofRootHash?: string;
    }): Promise<EvaluateResponse> => {
      if (!address) throw new Error("No proposal address");
      const res = await fetch(`/api/milestones/${address}/${milestoneIndex}/evaluate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(meta),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Evaluate failed");
      }
      return data as EvaluateResponse;
    },
    [address, milestoneIndex],
  );
}

function useTxHelpers() {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });
  return { writeContractAsync, hash, isPending, error, receipt };
}

/** Approve SprkCoin + challenge(milestoneIndex). */
export function useChallenge(collab: Address | undefined, milestoneIndex = 0) {
  const { contracts } = useNetwork();
  const { writeContractAsync, hash, isPending, error, receipt } = useTxHelpers();
  const { data: bond } = useReadContract({
    address: collab,
    abi: SprkClubCollabAbi,
    functionName: "disputeBond",
    query: { enabled: Boolean(collab) },
  });

  const challenge = useCallback(async () => {
    if (!collab) throw new Error("No collab address");
    if (bond === undefined) throw new Error("Dispute bond not loaded");

    const approveHash = await writeContractAsync({
      address: contracts.stablecoin,
      abi: MyTokenAbi,
      functionName: "approve",
      args: [collab, bond],
    });
    await waitForTransactionReceipt(wagmiConfig, { hash: approveHash });

    return writeContractAsync({
      address: collab,
      abi: SprkClubCollabAbi,
      functionName: "challenge",
      args: [BigInt(milestoneIndex)],
    });
  }, [collab, bond, writeContractAsync, milestoneIndex]);

  return { writeContractAsync, hash, isPending, error, receipt, bond, challenge };
}

export function useVote(collab: Address | undefined, milestoneIndex = 0) {
  const helpers = useTxHelpers();
  const vote = useCallback(
    async (supportAlice: boolean) => {
      if (!collab) throw new Error("No collab address");
      return helpers.writeContractAsync({
        address: collab,
        abi: SprkClubCollabAbi,
        functionName: "vote",
        args: [BigInt(milestoneIndex), supportAlice],
      });
    },
    [collab, helpers, milestoneIndex],
  );
  return { ...helpers, vote };
}

export function useFinalize(collab: Address | undefined, milestoneIndex = 0) {
  const helpers = useTxHelpers();
  const finalize = useCallback(async () => {
    if (!collab) throw new Error("No collab address");
    return helpers.writeContractAsync({
      address: collab,
      abi: SprkClubCollabAbi,
      functionName: "finalizeMilestone",
      args: [BigInt(milestoneIndex)],
    });
  }, [collab, helpers, milestoneIndex]);
  return { ...helpers, finalize };
}

export function useResolve(collab: Address | undefined, milestoneIndex = 0) {
  const helpers = useTxHelpers();
  const resolve = useCallback(async () => {
    if (!collab) throw new Error("No collab address");
    return helpers.writeContractAsync({
      address: collab,
      abi: SprkClubCollabAbi,
      functionName: "resolveChallenge",
      args: [BigInt(milestoneIndex)],
    });
  }, [collab, helpers, milestoneIndex]);
  return { ...helpers, resolve };
}

function statusLabel(status: number | undefined): string {
  switch (status) {
    case MilestoneStatusOnChain.None:
      return "No proof";
    case MilestoneStatusOnChain.ProofSubmitted:
      return "Proof submitted";
    case MilestoneStatusOnChain.InDisputeWindow:
      return "Dispute window";
    case MilestoneStatusOnChain.Challenged:
      return "Challenged";
    case MilestoneStatusOnChain.Finalized:
      return "Finalized";
    case MilestoneStatusOnChain.Rejected:
      return "Rejected";
    default:
      return "Unknown";
  }
}
