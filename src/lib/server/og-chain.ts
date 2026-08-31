import "server-only";

import { createPublicClient, createWalletClient, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { SprkClubCollabAbi } from "@/lib/chain/abi/SprkClubCollab";
import { activeChain } from "@/lib/chain/config";

/**
 * Server-side chain writes for the proof / audit trail.
 * Relayer signs `submitMileStoneProof` (creator key in practice today) and
 * `recordAuditRoot` (must be the on-chain `relayer`). Dispute txs stay in the wallet.
 */

export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(),
});

function getAccount() {
  const key = process.env.OG_PRIVATE_KEY;
  if (!key) throw new Error("OG_PRIVATE_KEY is not set");
  return privateKeyToAccount(
    (key.startsWith("0x") ? key : `0x${key}`) as `0x${string}`,
  );
}

/**
 * Records a 0G Storage Merkle root on-chain as proof for the current milestone.
 * Reverts unless the sending key is the proposal creator (`onlyProposalCreator`).
 */
export async function submitMilestoneProof(
  proposalAddr: Address,
  rootHash: `0x${string}`,
): Promise<`0x${string}`> {
  const account = getAccount();
  const wallet = createWalletClient({
    account,
    chain: activeChain,
    transport: http(),
  });

  // Simulate first so a revert surfaces as a readable error instead of a
  // silently-failing transaction the user pays for.
  const { request } = await publicClient.simulateContract({
    account,
    address: proposalAddr,
    abi: SprkClubCollabAbi,
    functionName: "submitMileStoneProof",
    args: [rootHash],
  });

  return wallet.writeContract(request);
}

/** Reads every proof root recorded for a milestone index. */
export async function readMilestoneProofs(
  proposalAddr: Address,
  milestoneIndex: number,
): Promise<`0x${string}`[]> {
  const roots: `0x${string}`[] = [];
  // `milestoneProofRoots` is a mapping to a dynamic array; the generated getter
  // takes (index, position) and reverts past the end, which is the only way to
  // learn the length.
  for (let i = 0; i < 64; i++) {
    try {
      const root = (await publicClient.readContract({
        address: proposalAddr,
        abi: SprkClubCollabAbi,
        functionName: "milestoneProofRoots",
        args: [BigInt(milestoneIndex), BigInt(i)],
      })) as `0x${string}`;
      roots.push(root);
    } catch {
      break;
    }
  }
  return roots;
}

/**
 * Records the 0G Compute scorecard Merkle root and starts the 7-day dispute window.
 * Must be signed by the on-chain `relayer`.
 */
export async function recordAuditRoot(
  proposalAddr: Address,
  milestoneIndex: number,
  rootHash: `0x${string}`,
): Promise<`0x${string}`> {
  const account = getAccount();
  const wallet = createWalletClient({
    account,
    chain: activeChain,
    transport: http(),
  });

  const { request } = await publicClient.simulateContract({
    account,
    address: proposalAddr,
    abi: SprkClubCollabAbi,
    functionName: "recordAuditRoot",
    args: [BigInt(milestoneIndex), rootHash],
  });

  return wallet.writeContract(request);
}

export type OnChainMilestoneView = {
  status: number;
  auditRootHash: `0x${string}`;
  auditRecordedAt: bigint;
  disputeBond: bigint;
};

export async function readMilestoneAudit(
  proposalAddr: Address,
  milestoneIndex: number,
): Promise<OnChainMilestoneView> {
  const [status, auditRootHash, auditRecordedAt, disputeBond] = await Promise.all([
    publicClient.readContract({
      address: proposalAddr,
      abi: SprkClubCollabAbi,
      functionName: "milestoneStatus",
      args: [BigInt(milestoneIndex)],
    }),
    publicClient.readContract({
      address: proposalAddr,
      abi: SprkClubCollabAbi,
      functionName: "auditRootHash",
      args: [BigInt(milestoneIndex)],
    }),
    publicClient.readContract({
      address: proposalAddr,
      abi: SprkClubCollabAbi,
      functionName: "auditRecordedAt",
      args: [BigInt(milestoneIndex)],
    }),
    publicClient.readContract({
      address: proposalAddr,
      abi: SprkClubCollabAbi,
      functionName: "disputeBond",
    }),
  ]);

  return {
    status: Number(status),
    auditRootHash: auditRootHash as `0x${string}`,
    auditRecordedAt: auditRecordedAt as bigint,
    disputeBond: disputeBond as bigint,
  };
}
