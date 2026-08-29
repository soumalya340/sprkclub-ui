"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProposalCard } from "@/components/proposal/proposal-card";
import { useSprkStore } from "@/lib/sprk-store";
import { formatAmount } from "@/lib/format";

const steps = [
  {
    n: "01",
    title: "Propose",
    body: "Draft the work, the NFT price, and the funding goal. Collab or Holder — two contract shapes, one club.",
  },
  {
    n: "02",
    title: "Vote",
    body: "Members signal support. Fifty-five percent converts a proposal into a live crowdfunding event.",
  },
  {
    n: "03",
    title: "Fund",
    body: "The creator stakes 20% of the goal. Backers mint NFTs until the sale fills.",
  },
  {
    n: "04",
    title: "Deliver",
    body: "Milestones go to the operator. Approved work unlocks withdrawal — or a dispute sends funds home.",
  },
];

export default function Home() {
  const proposals = useSprkStore((s) => s.proposals);
  const featured = proposals
    .filter((p) =>
      ["crowdfunding", "active", "passed", "voting"].includes(p.status),
    )
    .slice(0, 3);
  const raised = proposals.reduce((sum, p) => sum + p.totalFunding, 0);
  const live = proposals.filter(
    (p) => p.status === "crowdfunding" || p.status === "active",
  ).length;

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Sprkclub
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl">
          People make their <em className="italic">dreams</em> real.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          A DAO + NFT club for proposals that get voted, funded, and delivered.
          Stake, mint, and hold the work — not a pitch deck.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/launch/create-proposal">
              Create a proposal <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/explore/crowdfunding-events">Explore events</Link>
          </Button>
        </div>
        <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8">
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Proposals
            </dt>
            <dd className="mt-1 font-display text-3xl tabular-nums">{proposals.length}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Live events
            </dt>
            <dd className="mt-1 font-display text-3xl tabular-nums">{live}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Raised
            </dt>
            <dd className="mt-1 font-display text-3xl tabular-nums">
              {formatAmount(raised, "USDC").replace(" USDC", "")}
              <span className="ml-1 text-base text-muted-foreground">USDC</span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">On the floor</h2>
            <Button asChild variant="link" className="px-0">
              <Link href="/explore/ongoing-proposals">
                All proposals <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">How it works</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.n} className="flex flex-col gap-3">
                <span className="font-mono text-xs text-muted-foreground">{step.n}</span>
                <h3 className="font-display text-2xl tracking-tight">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
