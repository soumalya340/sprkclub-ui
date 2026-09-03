"use client";

import { Badge } from "@/components/ui/badge";
import { useNetwork } from "@/lib/chain/network-context";
import { formatDate, truncateAddress } from "@/lib/format";
import type { Milestone, Proposal } from "@/lib/types";

function StatusBadge({ status }: { status: Milestone["status"] }) {
  if (status === "approved") return <Badge variant="success">Cleared</Badge>;
  if (status === "rejected") return <Badge variant="danger">Rejected</Badge>;
  return <Badge variant="muted">Submitted</Badge>;
}

/** A 0G root/tx hash as a Storage-explorer link, or an em dash when absent. */
function RootLink({
  hash,
  href,
}: {
  hash?: string;
  href?: (value: string) => string;
}) {
  const zero = `0x${"0".repeat(64)}`;
  if (!hash || hash === zero) {
    return <span className="text-muted-foreground">—</span>;
  }
  const label = truncateAddress(hash, 6);
  if (!href) return <span className="font-mono text-xs">{label}</span>;
  return (
    <a
      href={href(hash)}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-xs underline underline-offset-2 hover:text-foreground"
    >
      {label}
    </a>
  );
}

/**
 * Every milestone recorded for this campaign, with the 0G artefacts behind it.
 *
 * The first tranche is deliberately absent from these rows: the contract lets
 * the creator draw it on a met funding goal with no proof at all, so there is
 * no proof root and no 0G Compute audit for it. It is shown as its own leading
 * row so the numbering matches the on-chain milestone index.
 */
export function MilestoneTable({ proposal }: { proposal: Proposal }) {
  const { storageExplorerRoot, explorerTx } = useNetwork();

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[46rem] text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/60 text-left">
            <th className="px-4 py-2.5 font-medium text-muted-foreground">#</th>
            <th className="px-4 py-2.5 font-medium text-muted-foreground">
              Milestone
            </th>
            <th className="px-4 py-2.5 font-medium text-muted-foreground">
              Proof root
            </th>
            <th className="px-4 py-2.5 font-medium text-muted-foreground">
              0G Compute audit
            </th>
            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
              Score
            </th>
            <th className="px-4 py-2.5 font-medium text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border last:border-0">
            <td className="px-4 py-3 font-mono tabular-nums">0</td>
            <td className="px-4 py-3">
              <p className="font-medium">First tranche</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Drawn on a met funding goal — no proof required
              </p>
            </td>
            <td className="px-4 py-3 text-xs text-muted-foreground">
              Not required
            </td>
            <td className="px-4 py-3 text-xs text-muted-foreground">
              Not required
            </td>
            <td className="px-4 py-3 text-right text-muted-foreground">—</td>
            <td className="px-4 py-3">
              {proposal.withdrawn ? (
                <Badge variant="success">Withdrawn</Badge>
              ) : (
                <Badge variant="muted">Available</Badge>
              )}
            </td>
          </tr>

          {proposal.milestones.map((m, i) => (
            <tr key={m.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-mono tabular-nums">
                {m.milestoneIndex ?? i + 1}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">{m.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(m.submittedAt)}
                </p>
              </td>
              <td className="px-4 py-3">
                <RootLink hash={m.rootHash} href={storageExplorerRoot} />
                {m.chainTxHash ? (
                  <a
                    href={explorerTx(m.chainTxHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 block text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    proof tx
                  </a>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <RootLink hash={m.auditRootHash} href={storageExplorerRoot} />
                {m.auditProvider ? (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {m.auditProvider === "0g-compute"
                      ? "0G Compute"
                      : "Fallback Mode"}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">
                {m.auditScore == null ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  m.auditScore
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={m.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
