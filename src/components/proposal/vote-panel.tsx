"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { voteShare } from "@/lib/format";
import {
  canVoteWithBalance,
  formatDiscardCountdown,
  isVoteWindowExpired,
  MIN_SPRK_TO_VOTE,
} from "@/lib/proposal-lifecycle";
import { useAddress, useSprkStore } from "@/lib/sprk-store";
import type { Proposal } from "@/lib/types";
import { ConnectWallet } from "@/components/wallet/connect-wallet";
import { MyTokenAbi } from "@/lib/chain/abi/MyToken";
import { contracts } from "@/lib/chain/config";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function VotePanel({ proposal }: { proposal: Proposal }) {
  const address = useAddress();
  const { address: wagmiAddress } = useAccount();
  const vote = useSprkStore((s) => s.vote);
  const [pending, setPending] = useState<"like" | "dislike" | null>(null);
  const current = address ? proposal.voters[address] : undefined;
  const share = voteShare(proposal);
  const total = proposal.likes + proposal.dislikes;
  const expired =
    proposal.status === "discarded" || isVoteWindowExpired(proposal);
  const locked =
    expired || !["voting", "passed", "rejected"].includes(proposal.status);
  const isCreator =
    Boolean(address) && address.toLowerCase() === proposal.creator.toLowerCase();

  const tokenReady =
    Boolean(contracts.stablecoin) &&
    contracts.stablecoin !== "0x0000000000000000000000000000000000000000";

  const { data: decimals } = useReadContract({
    address: contracts.stablecoin,
    abi: MyTokenAbi,
    functionName: "decimals",
    query: { enabled: tokenReady },
  });

  const { data: rawBalance, isLoading: balanceLoading } = useReadContract({
    address: contracts.stablecoin,
    abi: MyTokenAbi,
    functionName: "balanceOf",
    args: wagmiAddress ? [wagmiAddress] : undefined,
    query: { enabled: tokenReady && Boolean(wagmiAddress) },
  });

  const balance =
    typeof rawBalance === "bigint" && typeof decimals === "number"
      ? Number(formatUnits(rawBalance, decimals))
      : null;
  const hasVotePower = !tokenReady || canVoteWithBalance(balance);

  async function cast(kind: "like" | "dislike") {
    if (pending) return;
    if (!hasVotePower) {
      toast.error(`Hold more than ${MIN_SPRK_TO_VOTE} SPRK to vote`);
      return;
    }
    setPending(kind);
    try {
      const ok = await vote(proposal.id, kind);
      if (ok) {
        toast.success(kind === "like" ? "Support recorded" : "Vote recorded");
      }
    } finally {
      setPending(null);
    }
  }

  if (expired) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">Discarded</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This idea ran past its one-month window and was removed from the club
          floor.
        </p>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          Voting is closed. This proposal moved on with {share}% support.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-3xl tabular-nums tracking-tight">{share}%</p>
        <p className="text-sm text-muted-foreground">
          {proposal.likes} for · {proposal.dislikes} against · {total} votes
        </p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-primary" style={{ width: `${share}%` }} />
      </div>
      <p className="mt-3 font-mono text-xs tabular-nums text-muted-foreground">
        {formatDiscardCountdown(proposal)} · discards after 1 month
      </p>
      {share < 55 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          55% support converts this into a campaign.
        </p>
      ) : null}
      {!address ? (
        <div className="mt-5">
          <ConnectWallet />
        </div>
      ) : isCreator ? (
        <p className="mt-5 text-sm text-muted-foreground">
          You created this proposal, so you can’t vote on it. Share the link and
          let other members support it.
        </p>
      ) : balanceLoading && tokenReady ? (
        <div className="mt-5 grid grid-cols-2 gap-2" aria-busy="true">
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      ) : !hasVotePower ? (
        <div className="mt-5 rounded-lg border border-border bg-secondary/60 p-4">
          <p className="text-sm text-foreground">
            Need more than {MIN_SPRK_TO_VOTE} SPRK to vote
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            You have{" "}
            <span className="font-mono tabular-nums">
              {balance == null ? "—" : Math.floor(balance)}
            </span>{" "}
            SPRK. Claim more on Join The Movement.
          </p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/join">Join The Movement</Link>
          </Button>
        </div>
      ) : pending ? (
        <div className="mt-5 grid grid-cols-2 gap-2" aria-busy="true" aria-live="polite">
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button
            variant={current === "like" ? "default" : "outline"}
            disabled={current === "like"}
            onClick={() => void cast("like")}
            className={cn(current === "like" && "pointer-events-none")}
          >
            <ThumbsUp /> Support
          </Button>
          <Button
            variant={current === "dislike" ? "destructive" : "outline"}
            disabled={current === "dislike"}
            onClick={() => void cast("dislike")}
            className={cn(current === "dislike" && "pointer-events-none")}
          >
            <ThumbsDown /> Pass
          </Button>
        </div>
      )}
    </div>
  );
}
