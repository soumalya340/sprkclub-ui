"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { OPERATOR_ADDRESS } from "@/lib/seed";
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
  const switchWallet = useSprkStore((s) => s.switchWallet);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [proof, setProof] = useState("");

  const isCreator = address.toLowerCase() === proposal.creator.toLowerCase();
  const isOperator = address.toLowerCase() === OPERATOR_ADDRESS.toLowerCase();
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
                    onClick={() => {
                      validateMilestone(proposal.id, m.id, true);
                      toast.success("Milestone approved");
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      validateMilestone(proposal.id, m.id, false);
                      toast.message("Milestone rejected");
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
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim().length < 3 || description.trim().length < 8) {
              toast.error("Add a title and a short proof note");
              return;
            }
            submitMilestone(proposal.id, {
              title,
              description,
              proof: proof || "ipfs://proof",
            });
            setTitle("");
            setDescription("");
            setProof("");
            toast.success("Milestone submitted for review");
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
            <Label htmlFor="ms-proof">Proof link</Label>
            <Input
              id="ms-proof"
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="ipfs://… or https://…"
            />
          </div>
          <Button type="submit" className="self-start">
            Submit for validation
          </Button>
        </form>
      ) : null}

      {proposal.status === "active" &&
      proposal.milestones.some((m) => m.status === "submitted") &&
      !isOperator ? (
        <p className="text-xs text-muted-foreground">
          Operator review is pending.{" "}
          <button
            type="button"
            className="underline underline-offset-4"
            onClick={() => {
              switchWallet("operator");
              toast.message("Switched to operator");
            }}
          >
            Switch to the operator wallet
          </button>{" "}
          to approve or reject.
        </p>
      ) : null}
    </div>
  );
}
