import { NextResponse } from "next/server";
import { createProposal, listProposals } from "@/lib/db/queries";
import { requireAddress } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ proposals: await listProposals() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load proposals" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const creator = requireAddress(body.address);

    const { title, description, pricePerNft, fundingGoal, type, validTill } = body;
    if (typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json({ error: "Title is too short" }, { status: 400 });
    }
    if (typeof description !== "string" || description.trim().length < 8) {
      return NextResponse.json({ error: "Description is too short" }, { status: 400 });
    }
    if (!(pricePerNft > 0) || !(fundingGoal > 0)) {
      return NextResponse.json(
        { error: "Price and funding goal must be positive" },
        { status: 400 },
      );
    }
    if (type !== "collab" && type !== "holder") {
      return NextResponse.json({ error: "Unknown proposal type" }, { status: 400 });
    }

    const proposal = await createProposal(
      { title, description, pricePerNft, fundingGoal, type, validTill },
      creator,
    );
    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
