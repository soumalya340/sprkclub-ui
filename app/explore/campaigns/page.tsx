"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ProposalCard } from "@/components/proposal/proposal-card";
import { useSprkStore } from "@/lib/sprk-store";

export default function CrowdfundingListPage() {
  const proposals = useSprkStore((s) => s.proposals);
  const list = proposals.filter((p) =>
    ["crowdfunding", "active", "disputed", "completed"].includes(p.status),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        kicker="Explore"
        title="Campaigns"
        description="Live sales, deliveries in progress, and closed rounds. Stake is always 20% of the goal."
      />
      {list.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No campaigns yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProposalCard key={p.id} proposal={p} toEvent />
          ))}
        </div>
      )}
    </div>
  );
}
