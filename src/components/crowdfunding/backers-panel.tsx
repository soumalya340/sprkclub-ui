"use client";

import { formatAmount, truncateAddress } from "@/lib/format";
import { useAddress } from "@/lib/sprk-store";
import type { Proposal } from "@/lib/types";

/**
 * Who funded this campaign and for how much.
 *
 * The amounts come from the `backers` table, which `recordMint` accumulates per
 * `(proposal, wallet)` on every mint — the contract itself only charges a flat
 * `salePrice` per ticket and emits `TicketMinted`, so per-wallet totals live
 * here rather than on-chain. Sorted by contribution, largest first.
 */
export function BackersPanel({ proposal }: { proposal: Proposal }) {
  const address = useAddress();
  const backers = [...proposal.backers].sort((a, z) => z.amount - a.amount);

  if (backers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No backers yet — the first mint will show up here.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {backers.map((b) => {
        const isYou = address
          ? b.address.toLowerCase() === address.toLowerCase()
          : false;
        return (
          <li
            key={b.address}
            className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0"
          >
            <span className="flex min-w-0 items-baseline gap-1.5">
              <span className="truncate font-mono text-xs">
                {truncateAddress(b.address, 4)}
              </span>
              {isYou ? (
                <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                  you
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-mono text-xs tabular-nums">
                {formatAmount(b.amount, proposal.stablecoin)}
              </span>
              <span className="block text-[10px] text-muted-foreground">
                {b.minted} ticket{b.minted === 1 ? "" : "s"}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
