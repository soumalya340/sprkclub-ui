import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/format";
import type { ProposalStatus } from "@/lib/types";

const variantFor: Record<
  ProposalStatus,
  "muted" | "success" | "warn" | "danger" | "outline" | "default"
> = {
  voting: "muted",
  passed: "success",
  rejected: "danger",
  crowdfunding: "outline",
  active: "success",
  disputed: "danger",
  completed: "default",
  failed: "danger",
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return <Badge variant={variantFor[status]}>{statusLabel(status)}</Badge>;
}
