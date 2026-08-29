"use client";

import { Logo } from "@/components/brand/logo";
import { activeChain } from "@/lib/chain/config";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            A DAO + NFT where people make their dreams real.
          </p>
        </div>
        <p className="self-start text-xs text-muted-foreground">
          Data in Neon · contracts on {activeChain.name}
        </p>
      </div>
    </footer>
  );
}
