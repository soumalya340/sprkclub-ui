import { NextResponse } from "next/server";
import { recordMilestoneAudit } from "@/lib/db/queries";
import { getNetwork } from "@/lib/server/network";
import { isAddress, type Address } from "viem";
import {
  readMilestoneAudit,
  readMilestoneProofs,
  recordAuditRoot,
} from "@/lib/server/og-chain";
import { evaluateMilestone } from "@/lib/server/og-compute";
import {
  StorageSubmitUnsupportedError,
  downloadFromStorage,
  uploadToStorage,
} from "@/lib/server/og-storage";
import { extractProofText } from "@/lib/server/sanitize";
import { MilestoneStatusOnChain } from "@/lib/chain/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type RouteContext = {
  params: Promise<{ proposalAddr: string; index: string }>;
};

function parseParams(proposalAddr: string, index: string) {
  if (!isAddress(proposalAddr)) {
    return { error: `Not a valid contract address: ${proposalAddr}` } as const;
  }
  const milestoneIndex = Number(index);
  if (!Number.isInteger(milestoneIndex) || milestoneIndex < 0) {
    return { error: `Milestone index must be a non-negative integer` } as const;
  }
  return { proposalAddr: proposalAddr as Address, milestoneIndex } as const;
}

/**
 * Grades the latest milestone proof with 0G Compute (or Fallback Mode), uploads
 * the scorecard JSON to 0G Storage, and records `auditRootHash` on-chain so the
 * 7-day dispute clock can start. Never leaves Alice stuck without an audit root
 * when a proof already exists.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const raw = await params;
  const parsed = parseParams(raw.proposalAddr, raw.index);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const network = await getNetwork();

  let body: {
    proposalTitle?: string;
    proposalDescription?: string;
    milestoneTitle?: string;
    milestoneAcceptance?: string;
    proofRootHash?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  let audit;
  try {
    audit = await readMilestoneAudit(
      parsed.proposalAddr,
      parsed.milestoneIndex,
      network,
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Failed to read on-chain milestone state: " +
          (error instanceof Error ? error.message : "unknown"),
      },
      { status: 502 },
    );
  }

  if (audit.status === MilestoneStatusOnChain.None) {
    return NextResponse.json(
      { error: "No proof submitted for this milestone yet" },
      { status: 409 },
    );
  }

  if (audit.status !== MilestoneStatusOnChain.ProofSubmitted) {
    return NextResponse.json(
      {
        error: "Milestone is not awaiting evaluation",
        status: audit.status,
        auditRootHash: audit.auditRootHash,
      },
      { status: 409 },
    );
  }

  const roots = await readMilestoneProofs(
    parsed.proposalAddr,
    parsed.milestoneIndex,
    network,
  );
  const proofRoot =
    (body.proofRootHash && /^0x[0-9a-fA-F]{64}$/.test(body.proofRootHash)
      ? body.proofRootHash
      : roots[roots.length - 1]) ?? null;

  let proofText = "(no proof bytes available — scoring from metadata only)";
  let storageDegraded = false;

  if (proofRoot) {
    try {
      const bytes = await downloadFromStorage(proofRoot, network);
      proofText = extractProofText(bytes);
    } catch (error) {
      storageDegraded = true;
      proofText =
        `Could not download proof ${proofRoot} from 0G Storage ` +
        `(${error instanceof Error ? error.message : "unknown"}). ` +
        `Creator notes: ${body.milestoneAcceptance ?? body.milestoneTitle ?? ""}`;
    }
  }

  const scorecard = await evaluateMilestone({
    proposalTitle: body.proposalTitle?.trim() || "Untitled proposal",
    proposalDescription: body.proposalDescription?.trim() || "",
    milestoneTitle: body.milestoneTitle,
    milestoneAcceptance: body.milestoneAcceptance,
    proofText,
    proofRootHash: proofRoot ?? undefined,
  }, network);

  const scorecardBytes = new TextEncoder().encode(
    JSON.stringify(scorecard, null, 2),
  );

  let upload;
  try {
    upload = await uploadToStorage(scorecardBytes, network);
  } catch (error) {
    if (error instanceof StorageSubmitUnsupportedError) {
      // Still allow recording the locally-computed root so the clock can start.
      upload = {
        rootHash: error.rootHash,
        storageTxHash: "",
        alreadyStored: false,
        degraded: true,
      };
    } else {
      return NextResponse.json(
        {
          error:
            "Scorecard graded, but 0G Storage upload failed: " +
            (error instanceof Error ? error.message : "unknown"),
          scorecard,
        },
        { status: 502 },
      );
    }
  }

  try {
    const chainTxHash = await recordAuditRoot(
      parsed.proposalAddr,
      parsed.milestoneIndex,
      upload.rootHash as `0x${string}`,
      network,
    );

    // Mirror the audit onto the milestone row so campaign pages can list
    // proof root + audit root without a chain read per milestone. Chain and
    // 0G Storage stay authoritative — a failure here must not fail the request
    // when the root is already recorded on-chain.
    try {
      await recordMilestoneAudit(parsed.proposalAddr, parsed.milestoneIndex, network, {
        auditRootHash: upload.rootHash,
        auditTxHash: chainTxHash,
        provider: scorecard.provider,
        overallScore: scorecard.overallScore,
      });
    } catch (error) {
      console.error("Failed to mirror milestone audit to the database", error);
    }

    return NextResponse.json({
      scorecard,
      auditRootHash: upload.rootHash,
      storageTxHash: upload.storageTxHash,
      chainTxHash,
      degraded: upload.degraded || storageDegraded,
      alreadyStored: upload.alreadyStored,
      proofRootHash: proofRoot,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Scorecard uploaded, but recording audit root on-chain failed: " +
          (error instanceof Error ? error.message : "unknown"),
        scorecard,
        auditRootHash: upload.rootHash,
        storageTxHash: upload.storageTxHash,
        degraded: upload.degraded || storageDegraded,
      },
      { status: 502 },
    );
  }
}

/** Returns on-chain audit + optional scorecard JSON when Storage can serve it. */
export async function GET(_request: Request, { params }: RouteContext) {
  const raw = await params;
  const parsed = parseParams(raw.proposalAddr, raw.index);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const network = await getNetwork();

  try {
    const audit = await readMilestoneAudit(
      parsed.proposalAddr,
      parsed.milestoneIndex,
      network,
    );
    let scorecard = null;
    const zero =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    if (audit.auditRootHash && audit.auditRootHash !== zero) {
      try {
        const bytes = await downloadFromStorage(audit.auditRootHash, network);
        scorecard = JSON.parse(bytes.toString("utf8"));
      } catch {
        scorecard = null;
      }
    }
    return NextResponse.json({
      status: audit.status,
      auditRootHash: audit.auditRootHash,
      auditRecordedAt: audit.auditRecordedAt.toString(),
      disputeBond: audit.disputeBond.toString(),
      scorecard,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to read audit state",
      },
      { status: 502 },
    );
  }
}
