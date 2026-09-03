import "server-only";

import { createPublicClient, createWalletClient, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { SprkClubCollabAbi } from "@/lib/chain/abi/SprkClubCollab";
import type { OgNetwork } from "@/lib/chain/chains";
import { chainFor } from "@/lib/chain/network";

/**
 * Server-side chain writes for the proof / audit trail.
 * Relayer signs `submitMileStoneProof` (creator key in practice today) and
 * `recordAuditRoot` (must be the on-chain `relayer`). Dispute txs stay in the wallet.
 *
 * Every entry point takes the network explicitly: a request that resolved to
 * testnet must never reach a mainnet contract, so there is no ambient "current
 * chain" client here to accidentally close over.
 */

const clients = new Map<OgNetwork, ReturnType<typeof createPublicClient>>();

export function publicClientFor(network: OgNetwork) {
  const cached = clients.get(network);
  if (cached) return cached;
  const client = createPublicClient({ chain: chainFor(network), transport: http() });
  clients.set(network, client);
  return client;
}

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
  network: OgNetwork,
): Promise<`0x${string}`> {
  const account = getAccount();
  const wallet = createWalletClient({
    account,
    chain: chainFor(network),
    transport: http(),
  });

  // Simulate first so a revert surfaces as a readable error instead of a
  // silently-failing transaction the user pays for.
  const { request } = await publicClientFor(network).simulateContract({
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
  network: OgNetwork,
): Promise<`0x${string}`[]> {
  const roots: `0x${string}`[] = [];
  // `milestoneProofRoots` is a mapping to a dynamic array; the generated getter
  // takes (index, position) and reverts past the end, which is the only way to
  // learn the length.
  for (let i = 0; i < 64; i++) {
    try {
      const root = (await publicClientFor(network).readContract({
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
  network: OgNetwork,
): Promise<`0x${string}`> {
  const account = getAccount();
  const wallet = createWalletClient({
    account,
    chain: chainFor(network),
    transport: http(),
  });

  const { request } = await publicClientFor(network).simulateContract({
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
  network: OgNetwork,
): Promise<OnChainMilestoneView> {
  const publicClient = publicClientFor(network);
  const [status, auditRootHash, auditRecordedAt] = await Promise.all([
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
  ]);

  // `disputeBond` is absent from Collab builds predating the dispute escrow —
  // notably the 0G mainnet deployment. It is only needed to open a challenge,
  // so a missing getter degrades to 0n rather than failing the whole read.
  let disputeBond = 0n;
  try {
    disputeBond = (await publicClient.readContract({
      address: proposalAddr,
      abi: SprkClubCollabAbi,
      functionName: "disputeBond",
    })) as bigint;
  } catch {
    console.warn(
      `[og-chain] disputeBond() missing on ${proposalAddr} (${network}); ` +
        "this Collab predates the dispute escrow. Challenges are unavailable.",
    );
  }

  return {
    status: Number(status),
    auditRootHash: auditRootHash as `0x${string}`,
    auditRecordedAt: auditRecordedAt as bigint,
    disputeBond: disputeBond as bigint,
  };
}
