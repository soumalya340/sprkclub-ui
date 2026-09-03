import { NextResponse } from "next/server";
import { getNetwork } from "@/lib/server/network";
import {
  generateProposalDescription,
  PROPOSAL_DESCRIPTION_MAX,
} from "@/lib/server/og-compute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const TYPES = new Set(["event", "project", "creative-work"]);

/**
 * Drafts a proposal description via 0G Compute for the launch form.
 * Body: { title, type, draft? }
 */
export async function POST(request: Request) {
  let body: { title?: string; type?: string; draft?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const type = String(body.type ?? "project");
  const draft = typeof body.draft === "string" ? body.draft : undefined;

  if (title.length < 3) {
    return NextResponse.json(
      { error: "Enter a title (3+ characters) before generating a description" },
      { status: 400 },
    );
  }
  if (!TYPES.has(type)) {
    return NextResponse.json(
      { error: `type must be one of ${[...TYPES].join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const network = await getNetwork();
    const result = await generateProposalDescription(
      {
        title,
        type: type as "event" | "project" | "creative-work",
        draft,
      },
      network,
    );
    return NextResponse.json({
      description: result.description,
      model: result.model,
      path: result.path,
      max: PROPOSAL_DESCRIPTION_MAX,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    console.warn(`[generate-description] ${message}`);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
