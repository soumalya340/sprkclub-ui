"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FundActions } from "@/components/crowdfunding/fund-actions";
import { MilestonePanel } from "@/components/milestone/milestone-panel";
import { StatusBadge } from "@/components/proposal/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatAmount,
  formatDate,
  fundingShare,
  truncateAddress,
  typeLabel,
} from "@/lib/format";
import { useSprkStore } from "@/lib/sprk-store";

export default function CrowdfundingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const proposal = useSprkStore((s) => s.proposals.find((p) => p.id === id));

  if (!proposal) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="font-display text-3xl">Event not found</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/explore/crowdfunding-events">Back to events</Link>
        </Button>
      </div>
    );
  }

  const share = fundingShare(proposal);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={proposal.cover}
              alt=""
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <StatusBadge status={proposal.status} />
            <Badge variant="muted">{typeLabel(proposal.type)}</Badge>
          </div>
          <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
            {proposal.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {proposal.description}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Price / NFT</dt>
              <dd className="mt-1 font-mono tabular-nums">
                {formatAmount(proposal.pricePerNft, proposal.stablecoin)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Goal</dt>
              <dd className="mt-1 font-mono tabular-nums">
                {formatAmount(proposal.fundingGoal, proposal.stablecoin)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Minted</dt>
              <dd className="mt-1 font-mono tabular-nums">{proposal.mintedCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Creator</dt>
              <dd className="mt-1 font-mono">{truncateAddress(proposal.creator)}</dd>
            </div>
          </dl>

          <div className="mt-10">
            <h2 className="font-display text-2xl tracking-tight">Milestones</h2>
            <div className="mt-4">
              <MilestonePanel proposal={proposal} />
            </div>
          </div>
        </div>

        <aside className="flex h-fit flex-col gap-4 lg:sticky lg:top-24">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Raised
            </p>
            <p className="mt-2 font-display text-3xl tabular-nums">
              {formatAmount(proposal.totalFunding, proposal.stablecoin)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              of {formatAmount(proposal.fundingGoal, proposal.stablecoin)} · {share}%
            </p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary" style={{ width: `${share}%` }} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {proposal.staked ? "Creator has staked." : "Stake pending."} Sale{" "}
              {proposal.startDate ? formatDate(proposal.startDate) : "—"} –{" "}
              {proposal.endDate ? formatDate(proposal.endDate) : "—"}
            </p>
          </div>
          <FundActions proposal={proposal} />
        </aside>
      </div>
    </div>
  );
}
