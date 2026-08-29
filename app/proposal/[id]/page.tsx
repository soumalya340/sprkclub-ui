"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ConvertModal } from "@/components/proposal/convert-modal";
import { StatusBadge } from "@/components/proposal/status-badge";
import { VotePanel } from "@/components/proposal/vote-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatAmount,
  formatDate,
  isPassed,
  truncateAddress,
  typeLabel,
} from "@/lib/format";
import { useAddress, useSprkStore } from "@/lib/sprk-store";

export default function ProposalDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const proposal = useSprkStore((s) => s.proposals.find((p) => p.id === id));
  const address = useAddress();

  if (!proposal) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="font-display text-3xl">Proposal not found</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/explore/ongoing-proposals">Back to proposals</Link>
        </Button>
      </div>
    );
  }

  const isCreator = address.toLowerCase() === proposal.creator.toLowerCase();
  const live = ["crowdfunding", "active", "disputed", "completed"].includes(
    proposal.status,
  );

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
            <Badge variant={proposal.type === "holder" ? "outline" : "muted"}>
              {typeLabel(proposal.type)}
            </Badge>
          </div>
          <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
            {proposal.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {proposal.description}
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Price / NFT</dt>
              <dd className="mt-1 font-mono tabular-nums">
                {formatAmount(proposal.pricePerNft, proposal.stablecoin)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Funding goal</dt>
              <dd className="mt-1 font-mono tabular-nums">
                {formatAmount(proposal.fundingGoal, proposal.stablecoin)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Valid till</dt>
              <dd className="mt-1">{formatDate(proposal.validTill)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created by</dt>
              <dd className="mt-1 font-mono">{truncateAddress(proposal.creator)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="mt-1">{formatDate(proposal.createdAt)}</dd>
            </div>
          </dl>
        </div>
        <aside className="flex h-fit flex-col gap-4 lg:sticky lg:top-24">
          <VotePanel proposal={proposal} />
          {isCreator && proposal.status === "passed" && isPassed(proposal) ? (
            <ConvertModal proposal={proposal} />
          ) : null}
          {live ? (
            <Button asChild variant="outline">
              <Link href={`/explore/crowdfunding-events/${proposal.id}`}>
                Open crowdfunding event
              </Link>
            </Button>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
