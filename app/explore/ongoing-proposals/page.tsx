"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ProposalCard } from "@/components/proposal/proposal-card";
import { Button } from "@/components/ui/button";
import { isPubliclyListed } from "@/lib/proposal-lifecycle";
import { useSprkStore } from "@/lib/sprk-store";

export default function OngoingPage() {
  const proposals = useSprkStore((s) => s.proposals);
  const list = proposals.filter(
    (p) => p.status === "voting" && isPubliclyListed(p),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        kicker="Explore"
        title="Ongoing proposals"
        description="The club is still voting. Ideas stay open for one month — hold more than 10 SPRK to vote."
        action={
          <Button asChild>
            <Link href="/launch">Create proposal</Link>
          </Button>
        }
      />
      {list.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No ongoing proposals.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
        </div>
      )}
    </div>
  );
}
