"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DisputePanel } from "@/components/milestone/dispute-panel";
import { ScorecardPanel } from "@/components/milestone/scorecard-panel";
import { formatDate } from "@/lib/format";
import { MilestoneStatusOnChain } from "@/lib/chain/config";
import { useNetwork } from "@/lib/chain/network-context";
import {
  useAuditRoot,
  useProposalState,
  useRunEvaluate,
  useScorecard,
} from "@/lib/chain/hooks";
import { useAddress, useSprkStore } from "@/lib/sprk-store";
import type { Milestone, Proposal } from "@/lib/types";

function OffChainStatus({ status }: { status: Milestone["status"] }) {
  if (status === "approved") return <Badge variant="success">Cleared (DB)</Badge>;
  if (status === "rejected") return <Badge variant="danger">Rejected (DB)</Badge>;
  return <Badge variant="muted">Indexed</Badge>;
}

function LocationTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-sand-200 px-2 py-0.5 text-[10px] font-medium tracking-wide text-sand-900 uppercase">
      {children}
    </span>
  );
}

export function MilestonePanel({ proposal }: { proposal: Proposal }) {
  const { contracts } = useNetwork();
  const address = useAddress();
  const submitMilestone = useSprkStore((s) => s.submitMilestone);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const contractAddress = (proposal.contractAddress ?? contracts.collab) as Address;
  const { milestoneIndex } = useProposalState(contractAddress);
  const onChainIndex = milestoneIndex ?? 0;
  const audit = useAuditRoot(contractAddress, onChainIndex);
  const scorecardQuery = useScorecard(contractAddress, onChainIndex);
  const runEvaluate = useRunEvaluate(contractAddress, onChainIndex);

  const isCreator = address.toLowerCase() === proposal.creator.toLowerCase();
  const showForm = isCreator && proposal.status === "active";

  async function triggerEvaluate(opts?: {
    milestoneTitle?: string;
    milestoneAcceptance?: string;
    proofRootHash?: string;
  }) {
    setEvaluating(true);
    try {
      const result = await runEvaluate({
        proposalTitle: proposal.title,
        proposalDescription: proposal.description,
        milestoneTitle: opts?.milestoneTitle ?? title,
        milestoneAcceptance: opts?.milestoneAcceptance ?? description,
        proofRootHash: opts?.proofRootHash,
      });
      toast.success(
        result.scorecard.provider === "0g-compute"
          ? "0G Compute scorecard recorded — dispute window started"
          : "Fallback Mode scorecard recorded — dispute window started",
      );
      await Promise.all([audit.refetch(), scorecardQuery.refetch()]);
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Evaluate failed");
      return null;
    } finally {
      setEvaluating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {proposal.milestones.length === 0 ? (
        <p className="text-sm text-muted-foreground">No milestones submitted yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {proposal.milestones.map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-border bg-secondary p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{m.title}</p>
                    <LocationTag>Off-chain</LocationTag>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {m.description}
                  </p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    {m.proof} · {formatDate(m.submittedAt)}
                  </p>
                </div>
                <OffChainStatus status={m.status} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Milestone #{onChainIndex}</p>
              <LocationTag>On-chain</LocationTag>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Status: {audit.statusLabel ?? "…"}
            </p>
          </div>
          {audit.status === MilestoneStatusOnChain.ProofSubmitted ? (
            <Button
              size="sm"
              disabled={evaluating}
              onClick={() =>
                triggerEvaluate({
                  milestoneTitle: proposal.milestones.at(-1)?.title,
                  milestoneAcceptance: proposal.milestones.at(-1)?.description,
                })
              }
            >
              {evaluating ? "Running AI audit…" : "Run AI audit"}
            </Button>
          ) : null}
        </div>

        <div className="mt-4">
          <ScorecardPanel
            scorecard={scorecardQuery.data?.scorecard}
            auditRootHash={audit.auditRootHash}
            degraded={false}
          />
        </div>

        <DisputePanel collab={contractAddress} milestoneIndex={onChainIndex} />
      </div>

      {showForm ? (
        <form
          className="grid gap-3 rounded-xl border border-border bg-card p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (title.trim().length < 3 || description.trim().length < 8) {
              toast.error("Add a title and a short proof note");
              return;
            }
            if (!file) {
              toast.error("Attach the proof file");
              return;
            }

            setUploading(true);
            try {
              const body = new FormData();
              body.append("file", file);
              const res = await fetch(
                `/api/milestones/${contractAddress}/${onChainIndex}/proof`,
                { method: "POST", body },
              );
              const data = await res.json();
              if (!res.ok) throw new Error(data.error ?? "0G upload failed");

              const ok = await submitMilestone(proposal.id, {
                title,
                description,
                rootHash: data.rootHash,
                chainTxHash: data.chainTxHash,
                milestoneIndex: onChainIndex,
              });
              if (!ok) return;

              toast.success(
                data.degraded
                  ? "Proof root recorded on-chain (0G Storage upload degraded)"
                  : "Proof stored on 0G and recorded on-chain",
              );

              // Auto-start advisory audit so the dispute clock can begin.
              await triggerEvaluate({
                milestoneTitle: title,
                milestoneAcceptance: description,
                proofRootHash: data.rootHash,
              });

              setTitle("");
              setDescription("");
              setFile(null);
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Proof submission failed",
              );
            } finally {
              setUploading(false);
            }
          }}
        >
          <p className="text-sm font-medium">Submit milestone proof</p>
          <div className="grid gap-2">
            <Label htmlFor="ms-title">Title</Label>
            <Input
              id="ms-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Studio fitted"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ms-desc">What was delivered</Label>
            <Textarea
              id="ms-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ms-proof">Proof file</Label>
            <Input
              id="ms-proof"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              Uploaded to 0G Storage, root recorded on-chain, then graded by 0G
              Compute (or Fallback Mode). Humans still challenge / finalize.
            </p>
          </div>
          <Button type="submit" className="self-start" disabled={uploading || evaluating}>
            {uploading
              ? "Storing proof on 0G…"
              : evaluating
                ? "Running AI audit…"
                : "Submit proof + AI audit"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
