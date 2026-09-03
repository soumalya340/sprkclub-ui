import { NextResponse } from "next/server";
import { getProposal } from "@/lib/db/queries";
import { getNetwork } from "@/lib/server/network";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const proposal = await getProposal(id, await getNetwork());
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    return NextResponse.json({ proposal });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load" },
      { status: 500 },
    );
  }
}
