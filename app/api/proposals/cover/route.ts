import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAddress } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

/** Uploads a proposal cover image to Vercel Blob and returns its public URL. */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = requireAddress(searchParams.get("address"));
    const filename = searchParams.get("filename");
    if (!filename) {
      return NextResponse.json({ error: "filename is required" }, { status: 400 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG or WebP images are allowed" },
        { status: 400 },
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be under 8MB" }, { status: 400 });
    }

    if (!request.body) {
      return NextResponse.json({ error: "No file body" }, { status: 400 });
    }

    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    const key = `proposal-covers/${address}/${Date.now()}.${ext}`;

    const blob = await put(key, request.body, {
      access: "public",
      contentType,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
