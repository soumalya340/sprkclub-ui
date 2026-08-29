"use client";

import { CheckCircle2, ExternalLink, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SprkClubCollabAbi } from "@/lib/chain/abi/SprkClubCollab";
import { activeChain, explorerTx } from "@/lib/chain/config";
import { useIsVerifier, useMilestoneProofs, useProposalState } from "@/lib/chain/hooks";
import { truncateAddress } from "@/lib/format";

/**
 * Milestone review for the holder of the AgenticVerifier NFT. `validate()` is
 * gated on-chain by `AccessMaster.isOperator(caller) && verifier.balanceOf(caller) > 0`,
 * so the buttons below only succeed for a wallet holding both.
 */
export function OperatorReview({ proposalAddr }: { proposalAddr: Address }) {
  const { isConnected, chainId } = useAccount();
  const { isVerifier, isLoading: verifierLoading } = useIsVerifier();
  const state = useProposalState(proposalAddr);
  const milestoneIndex = state.milestoneIndex ?? 0;
  const proofs = useMilestoneProofs(proposalAddr, milestoneIndex);

  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash: txHash });

  const busy = isPending || confirming;
  const wrongChain = isConnected && chainId !== activeChain.id;

  async function validate(pass: boolean, reject: boolean) {
    try {
      const hash = await writeContractAsync({
        address: proposalAddr,
        abi: SprkClubCollabAbi,
        functionName: "validate",
        args: [pass, reject],
      });
      setTxHash(hash);
      toast.success(pass ? "Milestone approved" : "Milestone rejected");
      // Give the node a moment before re-reading the gated state.
      setTimeout(() => {
        state.refetch();
        proofs.refetch();
      }, 4000);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Transaction failed";
      toast.error(
        /User is not authorized/.test(message)
          ? "This wallet is not an authorized verifier"
          : "Validation failed",
      );
      console.error(message);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Operator review</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Milestone {milestoneIndex} ·{" "}
            {state.paused ? "awaiting validation" : "unlocked"}
          </p>
        </div>
        {state.rejected ? (
          <Badge variant="danger">Rejected</Badge>
        ) : state.paused ? (
          <Badge variant="warn">Paused</Badge>
        ) : (
          <Badge variant="success">Active</Badge>
        )}
      </div>

      <div>
        <p className="text-xs text-muted-foreground">
          0G Storage proof roots on-chain
        </p>
        {proofs.isLoading ? (
          <p className="mt-2 text-xs text-muted-foreground">Loading…</p>
        ) : proofs.data && proofs.data.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-1.5">
            {proofs.data.map((root) => (
              <li
                key={root}
                className="break-all rounded-md bg-secondary px-2.5 py-1.5 font-mono text-xs"
              >
                {root}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            No proof submitted for this milestone yet.
          </p>
        )}
      </div>

      {!isConnected ? (
        <p className="text-xs text-muted-foreground">
          Connect a wallet to review this milestone.
        </p>
      ) : wrongChain ? (
        <p className="text-xs text-warn">Switch to {activeChain.name} to review.</p>
      ) : !verifierLoading && !isVerifier ? (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <ShieldAlert className="mt-px size-3.5 shrink-0" />
          <span>
            This wallet does not hold the AgenticVerifier NFT, so{" "}
            <code className="font-mono">validate()</code> will revert.
          </span>
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busy} onClick={() => validate(true, false)}>
            {busy ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => validate(false, false)}
          >
            <XCircle />
            Reject
          </Button>
        </div>
      )}

      {txHash ? (
        <a
          href={explorerTx(txHash)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 self-start text-xs underline underline-offset-4"
        >
          {truncateAddress(txHash, 8)}
          <ExternalLink className="size-3" />
        </a>
      ) : null}
    </div>
  );
}
