"use client";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useSprkStore } from "@/lib/sprk-store";

export function Footer() {
  const resetDemo = useSprkStore((s) => s.resetDemo);

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            A DAO + NFT where people make their dreams real.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="self-start text-muted-foreground"
          onClick={() => resetDemo()}
        >
          Reset demo
        </Button>
      </div>
    </footer>
  );
}
