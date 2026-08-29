"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Address } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { AgenticVerifierAbi } from "@/lib/chain/abi/AgenticVerifier";
import { SprkClubCollabAbi } from "@/lib/chain/abi/SprkClubCollab";
import { activeChain, contracts } from "@/lib/chain/config";

/**
 * Reads the live state of a deployed SprkClub proposal. `submitMileStoneProof`,
 * `validate`, `numberOfMileStones` and `pause` share identical signatures on the
 * Collab and Holder contracts, so the Collab ABI serves both.
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
      milestoneIndex: value<number>(1),
      paused: value<boolean>(2),
      rejected: value<boolean>(3),
      staked: value<boolean>(4),
      fundsInReserve: value<bigint>(5),
      fundingGoal: value<bigint>(6),
    };
  }, [data, isLoading, refetch]);
}

/** True when the connected wallet holds an AgenticVerifier NFT (the validate() gate). */
export function useIsVerifier() {
  const { address } = useAccount();

  const { data, isLoading } = useReadContract({
    address: contracts.agenticVerifier,
    abi: AgenticVerifierAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  return { isVerifier: typeof data === "bigint" && data > 0n, isLoading };
}

/**
 * Proof roots recorded on-chain for a milestone index, read through the API
 * route so the array-length probing stays on the server.
 */
export function useMilestoneProofs(address: Address | undefined, milestoneIndex = 0) {
  return useQuery({
    queryKey: ["milestone-proofs", activeChain.id, address, milestoneIndex],
    enabled: Boolean(address),
    refetchInterval: 20_000,
    queryFn: async (): Promise<string[]> => {
      const res = await fetch(`/api/milestones/${address}/${milestoneIndex}/proof`);
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load proofs");
      return (await res.json()).roots ?? [];
    },
  });
}
