import { NextResponse } from "next/server";
import { downloadFromStorage } from "@/lib/server/og-storage";

// The 0G download path writes to the filesystem, so it is Node-only.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Streams a proof file back from 0G Storage by its Merkle root hash. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ rootHash: string }> },
) {
  const { rootHash } = await params;

  if (!/^0x[0-9a-fA-F]{64}$/.test(rootHash)) {
    return NextResponse.json({ error: "Not a valid root hash" }, { status: 400 });
  }

  try {
    const bytes = await downloadFromStorage(rootHash);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "content-type": "application/octet-stream",
        "content-disposition": `attachment; filename="${rootHash.slice(0, 18)}.bin"`,
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "0G Storage download failed" },
      { status: 502 },
    );
  }
}
