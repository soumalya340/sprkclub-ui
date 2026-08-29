import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import {
  formatAmount,
  formatDate,
  fundingShare,
  typeLabel,
  voteShare,
} from "@/lib/format";
import type { Proposal } from "@/lib/types";

export function ProposalCard({
  proposal,
  toEvent = false,
}: {
  proposal: Proposal;
  toEvent?: boolean;
}) {
  const funded = ["crowdfunding", "active", "disputed", "completed", "failed"].includes(
    proposal.status,
  );
  const share = funded ? fundingShare(proposal) : voteShare(proposal);

  const inner = (
    <>
      <div className="relative aspect-[3/2] overflow-hidden bg-secondary">
        <img
          src={proposal.cover}
          alt=""
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={proposal.status} />
          <Badge variant="muted">{typeLabel(proposal.type)}</Badge>
        </div>
        <h3 className="font-display text-2xl leading-snug tracking-tight text-foreground">
          {proposal.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {proposal.description}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {funded ? "Funded" : "Support"}
            </p>
            <p className="font-mono text-sm tabular-nums text-foreground">
              {funded
                ? `${share}% · ${formatAmount(proposal.totalFunding, proposal.stablecoin)}`
                : `${share}% of voters`}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {funded
              ? `Ends ${formatDate(proposal.endDate ?? proposal.validTill)}`
              : `Valid till ${formatDate(proposal.validTill)}`}
          </p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
        </div>
      </div>
    </>
  );

  const className =
    "group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground no-underline shadow-[0_0_0_1px_color-mix(in_oklab,var(--foreground)_6%,transparent)] transition-[box-shadow,transform] duration-200 ease-out hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--foreground)_16%,transparent)]";

  if (toEvent) {
    return (
      <Link href={`/explore/crowdfunding-events/${proposal.id}`} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <Link href={`/proposal/${proposal.id}`} className={className}>
      {inner}
    </Link>
  );
}
