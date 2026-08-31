"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MilestoneStatusOnChain,
  explorerTx,
} from "@/lib/chain/config";
import {
  useChallenge,
  useCollabTicketBalance,
  useDisputeState,
  useFinalize,
  useHasVoted,
  useResolve,
  useVote,
} from "@/lib/chain/hooks";

function formatCountdown(targetSec: number | undefined): string {
  if (!targetSec) return "—";
  const remaining = Math.max(0, targetSec - Math.floor(Date.now() / 1000));
  if (remaining <= 0) return "elapsed";
  const d = Math.floor(remaining / 86400);
  const h = Math.floor((remaining % 86400) / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function DisputePanel({
  collab,
  milestoneIndex,
}: {
  collab: Address;
  milestoneIndex: number;
}) {
  const dispute = useDisputeState(collab, milestoneIndex);
  const { data: ticketBalance } = useCollabTicketBalance(collab);
  const { data: voted } = useHasVoted(collab, milestoneIndex);
  const challengeTx = useChallenge(collab, milestoneIndex);
  const voteTx = useVote(collab, milestoneIndex);
  const finalizeTx = useFinalize(collab, milestoneIndex);
  const resolveTx = useResolve(collab, milestoneIndex);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const now = Math.floor(Date.now() / 1000);
  const windowOpen =
    dispute.status === MilestoneStatusOnChain.InDisputeWindow &&
    dispute.windowEnd !== undefined &&
    now < dispute.windowEnd;
  const canFinalize =
    dispute.status === MilestoneStatusOnChain.InDisputeWindow &&
    dispute.windowEnd !== undefined &&
    now >= dispute.windowEnd;
  const voteOpen =
    dispute.status === MilestoneStatusOnChain.Challenged &&
    dispute.challenge &&
    !dispute.challenge.resolved &&
    now < Number(dispute.challenge.voteEnd);
  const canResolve =
    dispute.status === MilestoneStatusOnChain.Challenged &&
    dispute.challenge &&
    !dispute.challenge.resolved &&
    now >= Number(dispute.challenge.voteEnd);

  const bondLabel =
    challengeTx.bond !== undefined
      ? `${formatUnits(challengeTx.bond, 18)} stable`
      : "10 stable";

  if (
    dispute.status === undefined ||
    dispute.status === MilestoneStatusOnChain.None ||
    dispute.status === MilestoneStatusOnChain.ProofSubmitted
  ) {
    return null;
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium">Dispute machine</p>
        <Badge variant="outline">{dispute.statusLabel}</Badge>
      </div>

      {dispute.status === MilestoneStatusOnChain.InDisputeWindow ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-muted-foreground">
            Challenge window ends in{" "}
            <span className="font-mono tabular-nums">
              {formatCountdown(dispute.windowEnd)}
            </span>
            . Anyone may challenge with a {bondLabel} bond. After the window,
            anyone may finalize if unchallenged.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!windowOpen || challengeTx.isPending}
              onClick={async () => {
                try {
                  const hash = await challengeTx.challenge();
                  toast.success("Challenge submitted", {
                    action: {
                      label: "Tx",
                      onClick: () => window.open(explorerTx(hash), "_blank"),
                    },
                  });
                  await dispute.refetchAll();
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Challenge failed",
                  );
                }
              }}
            >
              Challenge ({bondLabel})
            </Button>
            <Button
              size="sm"
              disabled={!canFinalize || finalizeTx.isPending}
              onClick={async () => {
                try {
                  const hash = await finalizeTx.finalize();
                  toast.success("Milestone finalized", {
                    action: {
                      label: "Tx",
                      onClick: () => window.open(explorerTx(hash), "_blank"),
                    },
                  });
                  await dispute.refetchAll();
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Finalize failed",
                  );
                }
              }}
            >
              Finalize
            </Button>
          </div>
        </div>
      ) : null}

      {dispute.status === MilestoneStatusOnChain.Challenged && dispute.challenge ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-muted-foreground">
            Challenger{" "}
            <span className="font-mono text-xs">
              {dispute.challenge.challenger.slice(0, 10)}…
            </span>
            . Vote ends in{" "}
            <span className="font-mono tabular-nums">
              {formatCountdown(Number(dispute.challenge.voteEnd))}
            </span>
            .
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="font-mono tabular-nums">
              Alice {dispute.challenge.votesForAlice.toString()}
            </span>
            <span className="font-mono tabular-nums">
              Bob {dispute.challenge.votesForBob.toString()}
            </span>
            <span className="text-muted-foreground">
              Your tickets: {(ticketBalance ?? 0n).toString()}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={
                !voteOpen ||
                voteTx.isPending ||
                Boolean(voted) ||
                !ticketBalance ||
                ticketBalance === 0n
              }
              onClick={async () => {
                try {
                  const hash = await voteTx.vote(true);
                  toast.success("Voted for Alice (creator)", {
                    action: {
                      label: "Tx",
                      onClick: () => window.open(explorerTx(hash), "_blank"),
                    },
                  });
                  await dispute.refetchAll();
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Vote failed",
                  );
                }
              }}
            >
              Support Alice
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={
                !voteOpen ||
                voteTx.isPending ||
                Boolean(voted) ||
                !ticketBalance ||
                ticketBalance === 0n
              }
              onClick={async () => {
                try {
                  const hash = await voteTx.vote(false);
                  toast.success("Voted for Bob (challenger)", {
                    action: {
                      label: "Tx",
                      onClick: () => window.open(explorerTx(hash), "_blank"),
                    },
                  });
                  await dispute.refetchAll();
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Vote failed",
                  );
                }
              }}
            >
              Support Bob
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!canResolve || resolveTx.isPending}
              onClick={async () => {
                try {
                  const hash = await resolveTx.resolve();
                  toast.success("Challenge resolved", {
                    action: {
                      label: "Tx",
                      onClick: () => window.open(explorerTx(hash), "_blank"),
                    },
                  });
                  await dispute.refetchAll();
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Resolve failed",
                  );
                }
              }}
            >
              Resolve
            </Button>
          </div>
          {voted ? (
            <p className="text-xs text-muted-foreground">You already voted.</p>
          ) : null}
        </div>
      ) : null}

      {dispute.status === MilestoneStatusOnChain.Finalized ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Milestone cleared. Creator can withdraw the next tranche when unpaused.
        </p>
      ) : null}

      {dispute.status === MilestoneStatusOnChain.Rejected ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Challenger won. Ticket holders can claimback; creator stake was slashed
          on-chain.
        </p>
      ) : null}
    </div>
  );
}
