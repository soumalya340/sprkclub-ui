"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { voteShare } from "@/lib/format";
import { useAddress, useSprkStore } from "@/lib/sprk-store";
import type { Proposal } from "@/lib/types";
import { ConnectWallet } from "@/components/wallet/connect-wallet";
import { cn } from "@/lib/utils";

export function VotePanel({ proposal }: { proposal: Proposal }) {
  const address = useAddress();
  const vote = useSprkStore((s) => s.vote);
  const [pending, setPending] = useState<"like" | "dislike" | null>(null);
  const current = address ? proposal.voters[address] : undefined;
  const share = voteShare(proposal);
  const total = proposal.likes + proposal.dislikes;
  const locked = !["voting", "passed", "rejected"].includes(proposal.status);
  const isCreator =
    Boolean(address) && address.toLowerCase() === proposal.creator.toLowerCase();

  async function cast(kind: "like" | "dislike") {
    if (pending) return;
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
      {share < 55 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          55% support converts this into a crowdfunding event.
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
