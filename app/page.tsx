"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Upload } from "lucide-react";
import { Geist, Special_Elite } from "next/font/google";
import Link from "next/link";
import { useRef, useState } from "react";
import { SparkMark } from "@/components/brand/logo";
import { ConnectWallet } from "@/components/wallet/connect-wallet";

const geist = Geist({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const specialElite = Special_Elite({ subsets: ["latin"], weight: "400" });

const HERO_VIDEO_SRC =
  "https://pollen-batch-41236914.figma.site/_components/v2/f0ee2dae7671c170c34f12e31c4cb41418976c98/769c564298c132f7919405cd9f17c1b1231f341d.769c5642.mp4";

function NavButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium text-[15px] uppercase tracking-[0.04em] text-[#1a1a1a] opacity-100 transition-opacity hover:opacity-55"
    >
      {children}
    </Link>
  );
}

function Hero() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pitch, setPitch] = useState("");

  function submitPitch() {
    const params = pitch.trim() ? `?description=${encodeURIComponent(pitch.trim())}` : "";
    router.push(`/launch${params}`);
  }

  return (
    <section className={`${geist.className} relative min-h-svh w-full overflow-hidden`}>
      <video
        className="absolute inset-0 z-0 size-full object-cover"
        src={HERO_VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[687px]"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
        }}
      />

      <div className="relative z-[2] mx-auto max-w-[1360px]">
        <nav className="flex items-center justify-between px-6 pb-4 pt-5 sm:px-20 sm:pt-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-black no-underline sm:gap-3"
          >
            <SparkMark className="size-6 shrink-0 sm:size-7" />
            <span
              className={`${specialElite.className} select-none text-[32px] leading-none sm:text-[40px]`}
            >
              sprkclub
            </span>
          </Link>

          <div className="absolute left-1/2 hidden -translate-x-1/2 gap-8 md:flex">
            <NavButton href="/launch">Launch</NavButton>
            <NavButton href="/explore/ongoing-proposals">Proposals</NavButton>
            <NavButton href="/explore/campaigns">Campaigns</NavButton>
            <NavButton href="/join">Join The Movement</NavButton>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <ConnectWallet className="h-auto rounded-full bg-[#0a0a0a] px-5 py-3.5 font-medium text-[15px] uppercase tracking-[0.04em] text-[#fafafa] transition-all hover:bg-[#333] active:scale-95" />
          </div>
        </nav>

        <div className="flex flex-col items-center px-6 pb-24 pt-16 text-center">
          <h1 className="mb-5 max-w-[820px] font-medium text-[clamp(40px,6vw,68px)] leading-[1.05] tracking-[-0.04em] text-[#1a1a1a]">
            People make their dreams real.
          </h1>
          <p className="mb-10 max-w-[500px] font-medium text-xl leading-relaxed text-[#767676]">
            Tell the club what you want to build. We&apos;ll turn it into a proposal
            the DAO can vote on, fund, and hold you to.
          </p>

          <div className="relative min-h-[208px] w-[701px] max-w-full overflow-hidden rounded-[44px] border-[3px] border-white bg-white/[0.06] shadow-[0_0_4px_0_rgba(0,0,0,0.15)] backdrop-blur-[20px] max-md:w-[calc(100vw-48px)]">
            <textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="I'm building a community darkroom with a monthly print swap. I want members to fund the lease and own a piece of the space...."
              className="absolute left-[29px] top-[24px] h-[90px] w-[609px] max-w-[calc(100%-58px)] resize-none border-none bg-transparent font-medium text-xl text-[#905831] leading-relaxed outline-none placeholder:text-[#905831]/70 max-md:text-[17px]"
            />

            <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" />
            <button
              type="button"
              aria-label="Upload reference material"
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-[21px] top-[137px] flex size-11 items-center justify-center rounded-full border border-white/70 bg-transparent backdrop-blur-[14px] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              <Upload className="size-[18px] shrink-0 text-[#1a1a1a]" />
            </button>

            <button
              type="button"
              onClick={submitPitch}
              className="absolute bottom-[21px] right-[21px] flex h-14 w-[156px] items-center justify-center rounded-[44px] border-none bg-black font-medium text-base uppercase tracking-[0.02em] text-[#fafafa] shadow-[0_0_2px_0_rgba(0,0,0,0.05)] transition-all hover:bg-[#333] active:scale-95"
            >
              Create a proposal
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    n: "01",
    title: "Propose",
    location: "OFF-CHAIN",
    body: "Draft the work, the NFT price, and the funding goal. Event, Project, or Creative Work — one club.",
  },
  {
    n: "02",
    title: "Vote",
    location: "ON-CHAIN",
    body: "Members signal support. Fifty-five percent converts a proposal into a live campaign.",
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
  return (
    <div>
      <Hero />

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
