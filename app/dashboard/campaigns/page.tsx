"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ProposalCard } from "@/components/proposal/proposal-card";
import { Button } from "@/components/ui/button";
import { useAddress, useSprkStore } from "@/lib/sprk-store";
import { ConnectWallet } from "@/components/wallet/connect-wallet";

export default function DashboardBackedPage() {
  const address = useAddress();
  const proposals = useSprkStore((s) => s.proposals);
  const backed = address
    ? proposals.filter((p) =>
        p.backers.some((b) => b.address.toLowerCase() === address.toLowerCase()),
      )
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        kicker="Dashboard"
        title="Backed campaigns"
        description="Campaigns you minted into. Dispute or claim back from here if delivery stalls."
      />
      {!address ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">Connect to see campaigns you backed.</p>
          <div className="mt-4">
            <ConnectWallet />
          </div>
        </div>
      ) : backed.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center">
          <p className="font-display text-2xl">No tickets yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Mint an NFT on a live campaign, or switch to the Backer wallet to see a seeded position.
          </p>
          <Button asChild className="mt-6">
            <Link href="/explore/campaigns">Browse campaigns</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {backed.map((p) => (
            <ProposalCard key={p.id} proposal={p} toEvent />
          ))}
        </div>
      )}
    </div>
  );
}
