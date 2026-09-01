"use client";

import { Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAddress } from "@/lib/sprk-store";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Cover image drop target. Uploads to Vercel Blob and returns the public URL.
 * `variant="banner"` matches the Launch create-proposal design (16/6).
 */
export function CoverUpload({
  value,
  onChange,
  variant = "card",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  variant?: "card" | "banner";
}) {
  const address = useAddress();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const banner = variant === "banner";

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
        <div
          className={cn(
            "group relative w-full overflow-hidden",
            banner
              ? "aspect-[16/6] min-h-[150px] rounded-[12px] border border-[rgba(26,24,20,0.13)]"
              : "aspect-[3/2] max-w-xs rounded-xl border border-border",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Proposal cover" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove cover image"
            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-[#FFFDF8]/90 text-[#1A1814] shadow-sm transition-opacity hover:bg-[#FFFDF8]"
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
            "flex w-full flex-col items-center justify-center gap-2 transition-[border-color,background-color] disabled:cursor-not-allowed disabled:opacity-60",
            banner
              ? "aspect-[16/6] min-h-[150px] rounded-[12px] border border-dashed border-[rgba(26,24,20,0.24)] bg-[#F3EFE4] text-[#8A8375] hover:border-[#1A1814] hover:bg-[#EFEADC]"
              : "aspect-[3/2] max-w-xs rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          )}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <span className={cn(banner ? "text-[22px] font-light leading-none" : "text-lg")}>
              +
            </span>
          )}
          <span className={cn(banner ? "text-[13px]" : "text-xs")}>
            {busy ? "Uploading…" : "Add cover image"}
          </span>
        </button>
      )}
    </div>
  );
}
