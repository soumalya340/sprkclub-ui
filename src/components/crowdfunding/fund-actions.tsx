"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { formatAmount, stakeAmount } from "@/lib/format";
import { useAddress, useSprkStore } from "@/lib/sprk-store";
import type { Proposal } from "@/lib/types";
import { ConnectWallet } from "@/components/wallet/connect-wallet";

export function FundActions({ proposal }: { proposal: Proposal }) {
  const address = useAddress();
  const stake = useSprkStore((s) => s.stake);
  const mint = useSprkStore((s) => s.mint);
  const withdraw = useSprkStore((s) => s.withdraw);
  const dispute = useSprkStore((s) => s.dispute);
  const claimback = useSprkStore((s) => s.claimback);
  const [reason, setReason] = useState("");

  if (!address) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Connect a wallet to take part.</p>
        <div className="mt-4">
          <ConnectWallet />
        </div>
      </div>
    );
  }

  const isCreator = address.toLowerCase() === proposal.creator.toLowerCase();
  const backer = proposal.backers.find(
    (b) => b.address.toLowerCase() === address.toLowerCase(),
  );
  const funded = proposal.totalFunding >= proposal.fundingGoal;
  const approved = proposal.milestones.some((m) => m.status === "approved");
  const stakeNeed = stakeAmount(proposal);

  // Mirrors SprkClubCollab: `intiateProposalFunding` unpauses on a fully funded
  // goal, so the first tranche is drawn with no proof at all — capped by
  // `withdrawFunds` at the same 20% of the goal the creator staked. Only the
  // tranches after it wait on a finalized milestone to unpause the contract.
  const isFirstTranche = proposal.milestones.length === 0 && !proposal.withdrawn;
  const trancheCap = stakeNeed;
  const canWithdraw = !proposal.withdrawn && (isFirstTranche ? funded : approved);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      {proposal.status === "crowdfunding" && !proposal.staked ? (
        isCreator ? (
          <Button
            onClick={async () => {
              const ok = await stake(proposal.id);
              if (ok) {
                toast.success(`Staked ${formatAmount(stakeNeed, proposal.stablecoin)}`);
              }
            }}
          >
            Stake {formatAmount(stakeNeed, proposal.stablecoin)}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Waiting on the creator to stake 20% of the goal before minting opens.
          </p>
        )
      ) : null}

      {proposal.staked && !funded && proposal.status === "crowdfunding" ? (
        <Button
          onClick={async () => {
            const ok = await mint(proposal.id);
            if (ok) {
              toast.success(
                `Minted 1 NFT for ${formatAmount(proposal.pricePerNft, proposal.stablecoin)}`,
              );
            }
          }}
        >
          Mint NFT · {formatAmount(proposal.pricePerNft, proposal.stablecoin)}
        </Button>
      ) : null}

      {proposal.status === "active" || proposal.status === "completed" ? (
        isCreator ? (
          <>
            <Button
              disabled={!canWithdraw}
              onClick={async () => {
                const ok = await withdraw(proposal.id);
                if (ok) toast.success("Funds withdrawn");
              }}
            >
              {proposal.withdrawn
                ? "Funds withdrawn"
                : isFirstTranche
                  ? `Withdraw first tranche · ${formatAmount(trancheCap, proposal.stablecoin)}`
                  : "Withdraw funds"}
            </Button>
            {!proposal.withdrawn && isFirstTranche ? (
              <p className="text-xs text-muted-foreground">
                The first tranche needs no proof — it is capped at{" "}
                {formatAmount(trancheCap, proposal.stablecoin)}, the 20% you
                staked. Later tranches unlock once a milestone is finalized.
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            The creator draws the first tranche (capped at the 20% they staked)
            once the goal is met. Every later tranche waits on a finalized
            milestone (or Alice winning a challenge).
          </p>
        )
      ) : null}

      {backer && (proposal.status === "crowdfunding" || proposal.status === "active") ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Dispute</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Open a dispute</DialogTitle>
              <DialogDescription>
                Pause this campaign and allow backers to claim refunds. Use this if
                the work is not being delivered.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="What went wrong?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (reason.trim().length < 8) {
                    toast.error("Add a short reason");
                    return;
                  }
                  const ok = await dispute(proposal.id, reason.trim());
                  if (ok) toast.message("Dispute opened");
                }}
              >
                Confirm dispute
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {backer && (proposal.status === "disputed" || proposal.status === "failed") ? (
        <Button
          variant="outline"
          onClick={async () => {
            const ok = await claimback(proposal.id);
            if (ok) {
              toast.success(
                `Claimed ${formatAmount(backer.amount, proposal.stablecoin)} back`,
              );
            }
          }}
        >
          Claimback {formatAmount(backer.amount, proposal.stablecoin)}
        </Button>
      ) : null}

      {backer ? (
        <p className="text-xs text-muted-foreground">
          You hold {backer.minted} NFT{backer.minted === 1 ? "" : "s"} ·{" "}
          {formatAmount(backer.amount, proposal.stablecoin)}
        </p>
      ) : null}
    </div>
  );
}
