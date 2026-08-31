"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { Address } from "viem";
import { contracts } from "@/lib/chain/config";
import { useIsVerifier, useProposalState } from "@/lib/chain/hooks";
import { useAddress, useSprkStore } from "@/lib/sprk-store";
import type { Milestone, Proposal } from "@/lib/types";

function MilestoneStatus({ status }: { status: Milestone["status"] }) {
  if (status === "approved") return <Badge variant="success">Approved</Badge>;
  if (status === "rejected") return <Badge variant="danger">Rejected</Badge>;
  return <Badge variant="warn">Awaiting operator</Badge>;
}

export function MilestonePanel({ proposal }: { proposal: Proposal }) {
  const address = useAddress();
  const submitMilestone = useSprkStore((s) => s.submitMilestone);
  const validateMilestone = useSprkStore((s) => s.validateMilestone);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const contractAddress = (proposal.contractAddress ?? contracts.collab) as Address;
  const { milestoneIndex } = useProposalState(contractAddress);
  const onChainIndex = milestoneIndex ?? 0;

  const isCreator = address.toLowerCase() === proposal.creator.toLowerCase();
  // Operator rights come from holding the AgenticVerifier NFT on 0G.
  const { isVerifier: isOperator } = useIsVerifier();
  const showForm = isCreator && proposal.status === "active";

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
                  <p className="font-medium">{m.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {m.description}
                  </p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    {m.proof} · {formatDate(m.submittedAt)}
                  </p>
                </div>
                <MilestoneStatus status={m.status} />
              </div>
              {isOperator && m.status === "submitted" ? (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      const ok = await validateMilestone(proposal.id, m.id, true);
                      if (ok) toast.success("Milestone approved");
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const ok = await validateMilestone(proposal.id, m.id, false);
                      if (ok) toast.message("Milestone rejected");
                    }}
                  >
                    Reject
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

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
              // Push the proof through 0G Storage first: the returned Merkle
              // root is what gets recorded on-chain and stored against the
              // milestone, so a failed upload must not create a bare record.
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

              setTitle("");
              setDescription("");
              setFile(null);
              toast.success(
                data.degraded
                  ? "Proof root recorded on-chain (0G Storage upload degraded)"
                  : "Proof stored on 0G and recorded on-chain",
              );
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Proof submission failed",
              );
            } finally {
              setUploading(false);
            }
          }}
        >
          <p className="text-sm font-medium">Submit milestone</p>
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
              Hashed into a 0G Storage Merkle root and recorded on 0G Chain.
            </p>
          </div>
          <Button type="submit" className="self-start" disabled={uploading}>
            {uploading ? "Storing proof on 0G…" : "Submit for validation"}
          </Button>
        </form>
      ) : null}

      {proposal.status === "active" &&
      proposal.milestones.some((m) => m.status === "submitted") &&
      !isOperator ? (
        <p className="text-xs text-muted-foreground">
          Operator review is pending. Connect the wallet holding the
          AgenticVerifier NFT to approve or reject.
        </p>
      ) : null}
    </div>
  );
}
