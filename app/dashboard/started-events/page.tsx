"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ProposalCard } from "@/components/proposal/proposal-card";
import { ConvertModal } from "@/components/proposal/convert-modal";
import { MilestonePanel } from "@/components/milestone/milestone-panel";
import { Button } from "@/components/ui/button";
import { isPassed, voteShare } from "@/lib/format";
import { useAddress, useSprkStore } from "@/lib/sprk-store";
import { ConnectWallet } from "@/components/wallet/connect-wallet";

export default function DashboardStartedPage() {
  const address = useAddress();
  const proposals = useSprkStore((s) => s.proposals);
  const mine = address
    ? proposals.filter((p) => p.creator.toLowerCase() === address.toLowerCase())
    : [];
  const activeWithMilestones = mine.filter(
    (p) =>
      p.status === "active" ||
      p.milestones.some((m) => m.status === "submitted"),
  );
  const readyToLaunch = mine.filter((p) => p.status === "passed");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <PageHeader
        kicker="Dashboard"
        title="Started events"
        description="Campaigns you created — stake, submit proofs, run AI audit, then finalize or face challenges."
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
                <Link href="/launch">Create proposal</Link>
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

          {readyToLaunch.length > 0 ? (
            <section id="ready-to-launch" className="mt-16 scroll-mt-24 border-t border-border pt-10">
              <h2 className="font-display text-3xl tracking-tight">Ready to launch</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Convert into a crowdfunding event and stake 20% of the goal to
                open minting.
              </p>
              <div className="mt-6 flex flex-col gap-4">
                {readyToLaunch.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5"
                  >
                    <div>
                      <h3 className="font-display text-xl tracking-tight">{p.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {voteShare(p)}% of voters support this proposal
                        {isPassed(p) ? " — ready to launch." : "."}
                      </p>
                    </div>
                    <ConvertModal proposal={p} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-16 border-t border-border pt-10">
            <h2 className="font-display text-3xl tracking-tight">Milestone escrow</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Proof → 0G Compute scorecard → 7-day challenge window → finalize or
              ticket-holder vote. No operator NFT gate.
            </p>
            {activeWithMilestones.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                No active campaigns with milestones yet.
              </p>
            ) : (
              <div className="mt-6 flex flex-col gap-8">
                {activeWithMilestones.map((p) => (
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
