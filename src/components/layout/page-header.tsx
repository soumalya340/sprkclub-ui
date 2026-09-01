import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  kicker,
  title,
  description,
  action,
  backHref = "/",
  backLabel = "Back",
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Omit or pass `null` to hide the back link. Defaults to home. */
  backHref?: string | null;
  backLabel?: string;
}) {
  return (
    <div className="border-b-dashed flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            {backLabel}
          </Link>
        ) : null}
        {kicker ? (
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-sand-1100">
            {kicker}
          </p>
        ) : null}
        <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
