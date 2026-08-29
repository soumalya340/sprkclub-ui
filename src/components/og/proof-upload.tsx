"use client";

import { CloudUpload, FileCheck2, Loader2, TriangleAlert } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Address } from "viem";
import { Button } from "@/components/ui/button";
import { explorerTx } from "@/lib/chain/config";

type UploadResponse = {
  rootHash: string;
  storageTxHash: string;
  chainTxHash: string;
  degraded?: boolean;
  fileName?: string;
  size?: number;
  error?: string;
  code?: string;
};

export function ProofUpload({
  proposalAddr,
  milestoneIndex,
  onRecorded,
}: {
  proposalAddr: Address;
  milestoneIndex: number;
  onRecorded?: (rootHash: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch(
        `/api/milestones/${proposalAddr}/${milestoneIndex}/proof`,
        { method: "POST", body },
      );
      const data: UploadResponse = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setResult(data);
      onRecorded?.(data.rootHash);
      toast.success(
        data.degraded
          ? "Proof root recorded on-chain (0G Storage upload degraded)"
          : "Proof uploaded to 0G Storage and recorded on-chain",
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setError(message);
      toast.error("Proof submission failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <div>
        <p className="text-sm font-medium">Submit milestone proof</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          The file is hashed into a Merkle root, uploaded to 0G Storage, and the
          root is recorded on-chain as milestone&nbsp;{milestoneIndex} proof.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setResult(null);
          setError(null);
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <CloudUpload />
          {file ? "Choose another" : "Choose file"}
        </Button>

        {file ? (
          <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
            {file.name} · {(file.size / 1024).toFixed(1)} KB
          </span>
        ) : null}
      </div>

      <Button
        type="button"
        className="self-start"
        disabled={!file || busy}
        onClick={upload}
      >
        {busy ? <Loader2 className="animate-spin" /> : <FileCheck2 />}
        {busy ? "Recording proof…" : "Submit proof"}
      </Button>

      {result ? (
        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-secondary p-3 text-xs">
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-muted-foreground">Merkle root</span>
            <span className="min-w-0 break-all font-mono">{result.rootHash}</span>
          </div>
          {result.chainTxHash ? (
            <a
              href={explorerTx(result.chainTxHash)}
              target="_blank"
              rel="noreferrer"
              className="self-start underline underline-offset-4"
            >
              View on 0G explorer
            </a>
          ) : null}
          {result.degraded ? (
            <p className="flex items-start gap-1.5 text-warn">
              <TriangleAlert className="mt-px size-3.5 shrink-0" />
              <span>
                Root computed locally and recorded on-chain, but the 0G Storage
                upload was rejected by the deployed Flow contract — the file
                itself is not retrievable yet.
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-xs leading-relaxed text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
