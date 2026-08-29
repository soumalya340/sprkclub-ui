"use client";

import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { ProposalCard } from "@/components/proposal/proposal-card";
import { MilestonePanel } from "@/components/milestone/milestone-panel";
import { Button } from "@/components/ui/button";
import { useIsVerifier } from "@/lib/chain/hooks";
import { useAddress, useSprkStore } from "@/lib/sprk-store";
import { ConnectWallet } from "@/components/wallet/connect-wallet";

export default function DashboardStartedPage() {
  const address = useAddress();
  const proposals = useSprkStore((s) => s.proposals);
  const mine = address
    ? proposals.filter((p) => p.creator.toLowerCase() === address.toLowerCase())
    : [];
  const queue = proposals.filter((p) =>
    p.milestones.some((m) => m.status === "submitted"),
  );
  // Operator rights are on-chain: holding the AgenticVerifier NFT.
  const { isVerifier } = useIsVerifier();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        kicker="Dashboard"
        title="Started events"
        description="Campaigns you created — stake, submit milestones, and withdraw after operator review."
      />

      {!address ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-8">
          <p className="text-sm text-muted-foreground">Connect to see events you started.</p>
          <div className="mt-4">
            <ConnectWallet />
          </div>
        </div>
      ) : (
        <>
          {mine.length === 0 ? (
            <div className="mt-10 rounded-xl border border-border bg-card p-10 text-center">
              <p className="font-display text-2xl">Nothing started yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a proposal, or switch to Harbor creator / Atelier creator to inspect the seeded rounds.
              </p>
              <Button asChild className="mt-6">
                <Link href="/launch/create-proposal">Create proposal</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mine.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  toEvent={["crowdfunding", "active", "disputed", "completed"].includes(
                    p.status,
                  )}
                />
              ))}
            </div>
          )}

          <section className="mt-16 border-t border-border pt-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl tracking-tight">Operator queue</h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Validate milestone proofs. Requires the AgenticVerifier NFT.
                </p>
              </div>
              {!isVerifier ? (
                <p className="max-w-xs text-xs text-muted-foreground">
                  This wallet does not hold the AgenticVerifier NFT, so on-chain
                  validation will revert.
                </p>
              ) : null}
            </div>
            {queue.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">No proofs waiting.</p>
            ) : (
              <div className="mt-6 flex flex-col gap-8">
                {queue.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-2xl tracking-tight">{p.title}</h3>
                      <Link
                        href={`/explore/crowdfunding-events/${p.id}`}
                        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                      >
                        Open event
                      </Link>
                    </div>
                    <div className="mt-4">
                      <MilestonePanel proposal={p} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
