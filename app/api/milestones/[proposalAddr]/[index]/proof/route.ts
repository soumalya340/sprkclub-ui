import { NextResponse } from "next/server";
import { getNetwork } from "@/lib/server/network";
import { isAddress, type Address } from "viem";
import { readMilestoneProofs, submitMilestoneProof } from "@/lib/server/og-chain";
import {
  StorageSubmitUnsupportedError,
  uploadToStorage,
} from "@/lib/server/og-storage";

// 0G Storage uploads sign a transaction and wait for storage-node replication,
// so this route must run on Node and is never statically rendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

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
 * Uploads a milestone proof file to 0G Storage, then records the returned Merkle
 * root on-chain via `submitMileStoneProof`. The two steps are deliberately
 * reported separately: if Storage succeeds and the chain write fails, the caller
 * still gets the root hash back so the upload isn't silently lost.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const raw = await params;
  const parsed = parseParams(raw.proposalAddr, raw.index);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const network = await getNetwork();

  let file: File | null = null;
  try {
    const form = await request.formData();
    const entry = form.get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return NextResponse.json(
      { error: "Expected a multipart/form-data body" },
      { status: 400 },
    );
  }

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "A non-empty file is required" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File exceeds the ${MAX_UPLOAD_BYTES / 1024 / 1024}MB limit` },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  let upload;
  try {
    upload = await uploadToStorage(bytes, network);
  } catch (error) {
    if (error instanceof StorageSubmitUnsupportedError) {
      return NextResponse.json(
        {
          error: error.message,
          code: "STORAGE_SUBMIT_UNSUPPORTED",
          rootHash: error.rootHash,
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "0G Storage upload failed" },
      { status: 502 },
    );
  }

  try {
    const chainTxHash = await submitMilestoneProof(
      parsed.proposalAddr,
      upload.rootHash as `0x${string}`,
      network,
    );
    return NextResponse.json({
      rootHash: upload.rootHash,
      storageTxHash: upload.storageTxHash,
      chainTxHash,
      alreadyStored: upload.alreadyStored,
      degraded: upload.degraded,
      fileName: file.name,
      size: file.size,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Uploaded to 0G Storage, but recording the root hash on-chain failed: " +
          (error instanceof Error ? error.message : "unknown error"),
        rootHash: upload.rootHash,
        storageTxHash: upload.storageTxHash,
      },
      { status: 502 },
    );
  }
}

/** Lists the proof roots recorded on-chain for this milestone index. */
export async function GET(_request: Request, { params }: RouteContext) {
  const raw = await params;
  const parsed = parseParams(raw.proposalAddr, raw.index);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const roots = await readMilestoneProofs(
      parsed.proposalAddr,
      parsed.milestoneIndex,
      await getNetwork(),
    );
    return NextResponse.json({ roots });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to read proof roots" },
      { status: 502 },
    );
  }
}
