"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { DM_Serif_Display, Manrope } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ProposalCard } from "@/components/proposal/proposal-card";
import { useSprkStore } from "@/lib/sprk-store";
import { formatAmount } from "@/lib/format";

const dmSerifDisplay = DM_Serif_Display({ subsets: ["latin"], weight: "400" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500"] });

const steps = [
  {
    n: "01",
    title: "Propose",
    location: "OFF-CHAIN",
    body: "Draft the work, the NFT price, and the funding goal. Collab or Holder — two contract shapes, one club.",
  },
  {
    n: "02",
    title: "Vote",
    location: "ON-CHAIN",
    body: "Members signal support. Fifty-five percent converts a proposal into a live crowdfunding event.",
  },
  {
    n: "03",
    title: "Fund",
    location: "ON-CHAIN",
    body: "The creator stakes 20% of the goal. Backers mint NFTs until the sale fills.",
  },
  {
    n: "04",
    title: "Deliver",
    location: "ON-CHAIN",
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
      <section className="hero-entrance mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Sprkclub
          </p>
          <h1
            className={`${dmSerifDisplay.className} mt-5 max-w-3xl text-5xl leading-[1.05] tracking-tight sm:text-7xl`}
          >
            People make their <em className="italic">dreams</em> real.
          </h1>
          <p
            className={`${manrope.className} mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg`}
          >
            A DAO + NFT club for proposals that get voted, funded, and delivered.
            Stake, mint, and hold the work — not a pitch deck.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/launch">
                Create a proposal <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/explore/crowdfunding-events">Explore events</Link>
            </Button>
          </div>
        </div>

        <dl className="border-t-dashed mt-14 grid grid-cols-3 gap-6 pt-8">
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-sand-1100">
              Proposals
            </dt>
            <dd className="mt-1 font-display text-3xl tabular-nums">{proposals.length}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-sand-1100">
              Live events
            </dt>
            <dd className="mt-1 font-display text-3xl tabular-nums">{live}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-sand-1100">
              Raised
            </dt>
            <dd className="mt-1 font-display text-3xl tabular-nums">
              {formatAmount(raised, "SPRK").replace(" SPRK", "")}
              <span className="ml-1 text-base text-muted-foreground">SPRK</span>
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
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            One pipeline, four stages. Each one hands off to the next — off-chain
            drafting becomes an on-chain commitment.
          </p>
          <ol className="border-all-dashed-medium mt-10 grid divide-y divide-dashed sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.n} className="group relative flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-sand-900">{step.n}</span>
                  <span className="rounded-full bg-sand-200 px-2 py-0.5 text-[10px] font-medium tracking-wide text-sand-900 uppercase">
                    {step.location}
                  </span>
                </div>
                <h3 className="font-display text-2xl tracking-tight">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                {i < steps.length - 1 ? (
                  <ChevronRight
                    className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 text-sand-500 lg:block"
                    aria-hidden="true"
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
