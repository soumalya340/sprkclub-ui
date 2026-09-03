import "server-only";

import { Indexer, MemData } from "@0gfoundation/0g-storage-ts-sdk";
import { ethers } from "ethers";
import type { OgNetwork } from "@/lib/chain/chains";
import { chainFor, storageIndexerUrl } from "@/lib/chain/network";

/**
 * 0G Storage access. Node-only by design: the SDK's upload path signs transactions
 * with a server-held key and its download path touches the filesystem, so per the
 * 0G integration notes the browser stays read-only and always goes through the API
 * routes in `app/api/`.
 */

/**
 * Raised when the Flow contract rejects the SDK's `submit` calldata. The Merkle
 * root is still valid and computed locally, so callers can record the proof
 * on-chain even though the bytes did not reach a storage node.
 */
export class StorageSubmitUnsupportedError extends Error {
  readonly rootHash: string;

  constructor(rootHash: string, cause: string) {
    super(
      "0G Storage rejected the upload transaction: the deployed Flow contract " +
        "does not expose the `submit` signature this SDK version encodes. " +
        `Underlying error: ${cause}`,
    );
    this.name = "StorageSubmitUnsupportedError";
    this.rootHash = rootHash;
  }
}

export type UploadResult = {
  rootHash: string;
  storageTxHash: string;
  /** True when the file was already present in 0G Storage (same content hash). */
  alreadyStored: boolean;
  /**
   * True when the Merkle root was computed locally but the bytes could not be
   * pushed to a storage node (e.g. Flow submit revert). Callers may still
   * record the root on-chain; retrieval from 0G Storage is unavailable until
   * a successful upload lands.
   */
  degraded: boolean;
};

/**
 * When true, an upload whose `submit` transaction is rejected still returns its
 * locally-computed Merkle root so the on-chain proof trail can proceed. Set
 * OG_STRICT_STORAGE=1 to make that a hard failure.
 */
const ALLOW_DEGRADED = process.env.OG_STRICT_STORAGE !== "1";

function requireEnv(name: string, chainName: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. 0G Storage uploads need a funded key on ${chainName}.`,
    );
  }
  return value;
}

function getSigner(network: OgNetwork): ethers.Wallet {
  const chain = chainFor(network);
  const provider = new ethers.JsonRpcProvider(
    chain.rpcUrls.default.http[0],
    chain.id,
  );
  return new ethers.Wallet(requireEnv("OG_PRIVATE_KEY", chain.name), provider);
}

function pickTxHash(
  res:
    | { txHash: string; rootHash: string; txSeq: number }
    | { txHashes: string[]; rootHashes: string[]; txSeqs: number[] }
    | null
    | undefined,
): string {
  if (!res) return "";
  if ("txHash" in res) return res.txHash ?? "";
  if ("txHashes" in res && Array.isArray(res.txHashes)) {
    return res.txHashes[0] ?? "";
  }
  return "";
}

function pickRootHash(
  res:
    | { txHash: string; rootHash: string; txSeq: number }
    | { txHashes: string[]; rootHashes: string[]; txSeqs: number[] }
    | null
    | undefined,
  fallback: string,
): string {
  if (!res) return fallback;
  if ("rootHash" in res && res.rootHash) return res.rootHash;
  if ("rootHashes" in res && Array.isArray(res.rootHashes) && res.rootHashes[0]) {
    return res.rootHashes[0];
  }
  return fallback;
}

/**
 * Uploads bytes to 0G Storage and returns the Merkle root that addresses them.
 * 0G Storage is content-addressed — the root hash is the only handle on the file.
 */
export async function uploadToStorage(
  bytes: Uint8Array,
  network: OgNetwork,
): Promise<UploadResult> {
  const indexer = new Indexer(storageIndexerUrl(network));
  const signer = getSigner(network);
  const file = new MemData(bytes);

  const [tree, treeErr] = await file.merkleTree();
  if (treeErr !== null || tree === null) {
    throw new Error(`Merkle tree failed: ${treeErr?.message ?? "unknown error"}`);
  }
  const rootHash = tree.rootHash();
  if (!rootHash) throw new Error("Merkle tree produced no root hash");

  const [res, uploadErr] = await indexer.upload(
    file,
    chainFor(network).rpcUrls.default.http[0],
    // The SDK's CommonJS build types `Signer` against its own bundled copy of
    // ethers, which is structurally identical but nominally distinct from the
    // ESM `Wallet` we construct here.
    signer as unknown as Parameters<Indexer["upload"]>[2],
  );

  if (uploadErr !== null) {
    const message = uploadErr.message ?? String(uploadErr);

    // A repeat upload of identical bytes is not a failure — the data is already
    // stored under the same root, which is exactly what the caller needs.
    if (/already exists|Data already/i.test(message)) {
      return { rootHash, storageTxHash: "", alreadyStored: true, degraded: false };
    }

    // Residual Flow/submit failures: keep a degraded root so the on-chain proof
    // trail can proceed unless OG_STRICT_STORAGE=1.
    if (/execution reverted/i.test(message)) {
      if (!ALLOW_DEGRADED) throw new StorageSubmitUnsupportedError(rootHash, message);
      console.warn(
        `[0g-storage] submit reverted; continuing with locally-computed root ${rootHash}. ` +
          "See StorageSubmitUnsupportedError for the cause.",
      );
      return { rootHash, storageTxHash: "", alreadyStored: false, degraded: true };
    }

    throw new Error(`0G Storage upload failed: ${message}`);
  }

  return {
    rootHash: pickRootHash(res, rootHash),
    storageTxHash: pickTxHash(res),
    alreadyStored: false,
    degraded: false,
  };
}

/** Downloads a stored file by root hash. Returns the raw bytes. */
export async function downloadFromStorage(
  rootHash: string,
  network: OgNetwork,
): Promise<Buffer> {
  const { mkdtemp, readFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");

  const indexer = new Indexer(storageIndexerUrl(network));
  const dir = await mkdtemp(join(tmpdir(), "og-proof-"));
  const outPath = join(dir, "proof.bin");

  try {
    const err = await indexer.download(rootHash, outPath, true);
    if (err !== null) {
      throw new Error(`0G Storage download failed: ${err.message ?? String(err)}`);
    }
    return await readFile(outPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
