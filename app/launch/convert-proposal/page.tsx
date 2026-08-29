"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ConvertModal } from "@/components/proposal/convert-modal";
import { StatusBadge } from "@/components/proposal/status-badge";
import { Button } from "@/components/ui/button";
import { formatAmount, isPassed, voteShare } from "@/lib/format";
import { useAddress, useSprkStore } from "@/lib/sprk-store";
import { ConnectWallet } from "@/components/wallet/connect-wallet";

export default function ConvertProposalPage() {
  const address = useAddress();
  const proposals = useSprkStore((s) => s.proposals);
  const lastCreatedId = useSprkStore((s) => s.lastCreatedId);
  const mine = address
    ? proposals.filter((p) => p.creator.toLowerCase() === address.toLowerCase())
    : [];
  const ready = mine.filter((p) => p.status === "passed" && isPassed(p));
  const highlighted = mine.find((p) => p.id === lastCreatedId) ?? ready[0] ?? mine[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        kicker="Launch"
        title="Convert a proposal"
        description="Once the club supports a proposal at 55%, convert it into a crowdfunding event and stake 20% of the goal."
      />

      {!address ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">
            Connect the wallet that created the proposal.
          </p>
          <div className="mt-4">
            <ConnectWallet />
          </div>
        </div>
      ) : mine.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center">
          <p className="font-display text-2xl">No proposal of yours yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Draft one first, or switch to a creator wallet from the header to try a seeded event.
          </p>
          <Button asChild className="mt-6">
            <Link href="/launch/create-proposal">Create proposal</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            {highlighted ? (
              <>
                <StatusBadge status={highlighted.status} />
                <h2 className="mt-4 font-display text-4xl tracking-tight">
                  {highlighted.title}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {highlighted.description}
                </p>
                <p className="mt-6 text-sm">
                  {voteShare(highlighted)}% of voters love this proposal
                  {isPassed(highlighted) ? " — it is ready to launch." : ". It needs 55% to convert."}
                </p>
                <div className="mt-8">
                  {highlighted.status === "passed" ? (
                    <ConvertModal proposal={highlighted} />
                  ) : highlighted.status === "crowdfunding" || highlighted.status === "active" ? (
                    <Button asChild>
                      <Link href={`/explore/crowdfunding-events/${highlighted.id}`}>
                        Open event
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link href={`/proposal/${highlighted.id}`}>
                        Open proposal to vote
                      </Link>
                    </Button>
                  )}
                </div>
              </>
            ) : null}
          </div>
          <aside className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Your proposals
            </p>
            {mine.map((p) => (
              <Link
                key={p.id}
                href={`/proposal/${p.id}`}
                className="rounded-lg border border-border bg-card p-4 no-underline"
              >
                <p className="font-medium text-foreground">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.status} · {formatAmount(p.fundingGoal, p.stablecoin)}
                </p>
              </Link>
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}
