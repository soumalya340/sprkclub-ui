"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAddress } from "@/lib/sprk-store";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Square dashed drop target for a proposal's cover image. Uploads straight to
 * Vercel Blob on selection and hands the resulting public URL back via
 * onChange — the form falls back to a stock cover when this stays empty.
 */
export function CoverUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const address = useAddress();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Use a JPEG, PNG or WebP image");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(
        `/api/proposals/cover?filename=${encodeURIComponent(file.name)}&address=${address}`,
        { method: "POST", headers: { "content-type": file.type }, body: file },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />

      {value ? (
        <div className="group relative aspect-[3/2] w-full max-w-xs overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Proposal cover" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove cover image"
            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-opacity hover:bg-background"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex aspect-[3/2] w-full max-w-xs flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Plus className="size-5" />
          )}
          <span className="text-xs">
            {busy ? "Uploading…" : "Add cover image"}
          </span>
        </button>
      )}
    </div>
  );
}
