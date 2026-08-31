"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatAmount, isPassed, stakeAmount } from "@/lib/format";
import { useAddress, useSprkStore } from "@/lib/sprk-store";
import type { Proposal } from "@/lib/types";

function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function ConvertModal({
  proposal,
  trigger,
}: {
  proposal: Proposal;
  trigger?: ReactNode;
}) {
  const router = useRouter();
  const address = useAddress();
  const convertProposal = useSprkStore((s) => s.convertProposal);
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(isoOffset(0));
  const [endDate, setEndDate] = useState(isoOffset(30));

  const isCreator = address.toLowerCase() === proposal.creator.toLowerCase();
  const canLaunch = isCreator && isPassed(proposal) && proposal.status === "passed";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button disabled={!canLaunch}>Launch crowdfunding</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Launch crowdfunding</DialogTitle>
          <DialogDescription>
            Convert {proposal.title} into a live sale. You will stake{" "}
            {formatAmount(stakeAmount(proposal), "SPRK")} (20% of the goal)
            before minting opens.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Starting date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Ending date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              if (!canLaunch) {
                toast.error("Only the creator can launch a passed proposal");
                return;
              }
              const ok = await convertProposal(proposal.id, {
                stablecoin: "SPRK",
                startDate,
                endDate,
              });
              if (!ok) return;
              toast.success("Proposal converted");
              setOpen(false);
              router.push(`/explore/crowdfunding-events/${proposal.id}`);
            }}
          >
            Launch crowdfunding
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
