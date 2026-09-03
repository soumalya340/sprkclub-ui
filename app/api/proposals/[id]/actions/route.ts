import { NextResponse } from "next/server";
import {
  castVote,
  convertProposal,
  disputeProposal,
  getProposal,
  norm,
  recordMint,
  setStaked,
  setStatus,
  setWithdrawn,
  submitMilestone,
  sweepProposalLifecycle,
} from "@/lib/db/queries";
import {
  canVoteWithBalance,
  isVoteWindowExpired,
  MIN_SPRK_TO_VOTE,
} from "@/lib/proposal-lifecycle";
import { requireAddress } from "@/lib/server/auth";
import { getNetwork } from "@/lib/server/network";
import { getSprkBalance } from "@/lib/server/sprk-balance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Single mutation endpoint for a proposal, dispatched on `action`. Each branch
 * re-reads the proposal first so ownership and state rules are checked against
 * the database rather than trusting the client's view of it.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const address = requireAddress(body.address);
    const network = await getNetwork();

    const proposal = await getProposal(id, network);
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const isCreator = norm(proposal.creator) === address;
    const deny = (message: string) =>
      NextResponse.json({ error: message }, { status: 403 });

    switch (body.action) {
      case "vote": {
        if (body.kind !== "like" && body.kind !== "dislike") {
          return NextResponse.json({ error: "Unknown vote kind" }, { status: 400 });
        }
        if (isCreator) return deny("A creator cannot vote on their own proposal");

        await sweepProposalLifecycle(network);
        const fresh = (await getProposal(id, network)) ?? proposal;
        if (fresh.status === "discarded" || isVoteWindowExpired(fresh)) {
          return deny("This proposal expired and was discarded");
        }
        if (fresh.status !== "voting" && fresh.status !== "passed") {
          return deny("Voting has closed for this proposal");
        }

        const balance = await getSprkBalance(address, network);
        if (balance != null && !canVoteWithBalance(balance)) {
          return deny(
            `Hold more than ${MIN_SPRK_TO_VOTE} SPRK to vote (you have ${Math.floor(balance)})`,
          );
        }

        await castVote(id, address, body.kind);
        break;
      }

      case "convert": {
        if (!isCreator) return deny("Only the creator can convert this proposal");
        if (proposal.status !== "passed") {
          return deny("Only a passed proposal can be converted");
        }
        const { stablecoin, startDate, endDate } = body;
        if (!stablecoin || !startDate || !endDate) {
          return NextResponse.json(
            { error: "stablecoin, startDate and endDate are required" },
            { status: 400 },
          );
        }
        await convertProposal(id, { stablecoin, startDate, endDate });
        break;
      }

      case "stake": {
        if (!isCreator) return deny("Only the creator can stake");
        await setStaked(id);
        break;
      }

      case "mint": {
        if (!proposal.staked) return deny("The creator has not staked yet");
        if (proposal.status !== "crowdfunding") {
          return deny("This event is not accepting mints");
        }
        await recordMint(id, address, network);
        break;
      }

      case "withdraw": {
        if (!isCreator) return deny("Only the creator can withdraw");
        await setWithdrawn(id);
        break;
      }

      case "dispute": {
        const reason = String(body.reason ?? "").trim();
        if (reason.length < 4) {
          return NextResponse.json({ error: "Give a reason" }, { status: 400 });
        }
        const isBacker = proposal.backers.some((b) => norm(b.address) === address);
        if (!isBacker) return deny("Only a backer can raise a dispute");
        await disputeProposal(id, address, reason);
        break;
      }

      case "claimback": {
        if (proposal.status !== "disputed" && proposal.status !== "failed") {
          return deny("Nothing to claim back");
        }
        await setStatus(id, "failed");
        break;
      }

      case "submit-milestone": {
        if (!isCreator) return deny("Only the creator can submit a milestone");
        const { title, description, proof, rootHash, chainTxHash, milestoneIndex } =
          body;
        if (typeof title !== "string" || title.trim().length < 3) {
          return NextResponse.json({ error: "Title is too short" }, { status: 400 });
        }
        await submitMilestone(id, {
          title,
          description: String(description ?? ""),
          proof,
          rootHash,
          chainTxHash,
          milestoneIndex,
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ proposal: await getProposal(id, network) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
