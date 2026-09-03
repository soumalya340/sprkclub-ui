"use client";

import { Badge } from "@/components/ui/badge";
import { useNetwork } from "@/lib/chain/network-context";
import type { Scorecard } from "@/lib/scorecard";

export function ScorecardPanel({
  scorecard,
  auditRootHash,
  degraded,
}: {
  scorecard: Scorecard | null | undefined;
  auditRootHash?: string | null;
  degraded?: boolean;
}) {
  const { storageExplorerRoot } = useNetwork();
  if (!scorecard) {
    return (
      <p className="text-sm text-muted-foreground">
        No scorecard yet. Run AI audit after the proof is on-chain.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium">AI scorecard</p>
        {scorecard.provider === "0g-compute" ? (
          <Badge variant="success">0G Compute</Badge>
        ) : (
          <Badge variant="warn">Fallback Mode</Badge>
        )}
        {degraded ? <Badge variant="warn">Degraded Storage</Badge> : null}
        <Badge variant={scorecard.pass ? "success" : "danger"}>
          {scorecard.pass ? "Provisional pass" : "Provisional fail"}
        </Badge>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {scorecard.overallScore}/100
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {scorecard.summary}
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {scorecard.criteria.map((c) => (
          <li
            key={c.id}
            className="rounded-md border border-border/70 bg-card/60 px-3 py-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">{c.label}</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {c.score}/100 · {c.pass ? "pass" : "fail"}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {c.evidence}
            </p>
          </li>
        ))}
      </ul>

      {scorecard.risks.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Risks
          </p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
            {scorecard.risks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-3 text-xs text-muted-foreground">
        Model: <span className="font-mono">{scorecard.model}</span>
        {" · "}
        {new Date(scorecard.evaluatedAt).toLocaleString()}
        {auditRootHash ? (
          <>
            {" · "}
            <a
              href={storageExplorerRoot(auditRootHash)}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:underline"
            >
              audit root
            </a>
          </>
        ) : null}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Advisory only — does not unlock funds. Ticket holders settle disputes.
      </p>
    </div>
  );
}
