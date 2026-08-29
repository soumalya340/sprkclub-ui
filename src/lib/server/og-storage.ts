import "server-only";

import { Indexer, MemData } from "@0glabs/0g-ts-sdk";
import { ethers } from "ethers";
import { activeChain, STORAGE_INDEXER_URL } from "@/lib/chain/config";

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
   * pushed to a storage node because of {@link StorageSubmitUnsupportedError}.
   * The proof trail on-chain is still valid and verifiable; only retrieval of
   * the original file from 0G Storage is unavailable.
   */
  degraded: boolean;
};

/**
 * When true, an upload whose `submit` transaction is rejected still returns its
 * locally-computed Merkle root so the on-chain proof trail can proceed. Set
 * OG_STRICT_STORAGE=1 to make that a hard failure once the SDK is fixed.
 */
const ALLOW_DEGRADED = process.env.OG_STRICT_STORAGE !== "1";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. 0G Storage uploads need a funded key on ${activeChain.name}.`,
    );
  }
  return value;
}

function getSigner(): ethers.Wallet {
  const provider = new ethers.JsonRpcProvider(
    activeChain.rpcUrls.default.http[0],
    activeChain.id,
  );
  return new ethers.Wallet(requireEnv("OG_PRIVATE_KEY"), provider);
}

/**
 * Uploads bytes to 0G Storage and returns the Merkle root that addresses them.
 * 0G Storage is content-addressed — the root hash is the only handle on the file.
 */
export async function uploadToStorage(bytes: Uint8Array): Promise<UploadResult> {
  const indexer = new Indexer(STORAGE_INDEXER_URL);
  const signer = getSigner();
  const file = new MemData(bytes);

  const [tree, treeErr] = await file.merkleTree();
  if (treeErr !== null || tree === null) {
    throw new Error(`Merkle tree failed: ${treeErr?.message ?? "unknown error"}`);
  }
  const rootHash = tree.rootHash();
  if (!rootHash) throw new Error("Merkle tree produced no root hash");

  const [res, uploadErr] = await indexer.upload(
    file,
    activeChain.rpcUrls.default.http[0],
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

    // Known upstream incompatibility: @0glabs/0g-ts-sdk@0.3.3 encodes
    // `submit((uint256,bytes,(bytes32,uint256)[]))` (selector 0xef3e12dc), which
    // is absent from the Flow implementation currently deployed on Galileo
    // (0x22E03a…5296 → impl 0xF99ccc…292F). Every submit reverts at any msg.value.
    // Surface that plainly instead of as an opaque `require(false)`.
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
    rootHash: res?.rootHash ?? rootHash,
    storageTxHash: res?.txHash ?? "",
    alreadyStored: false,
    degraded: false,
  };
}

/** Downloads a stored file by root hash. Returns the raw bytes. */
export async function downloadFromStorage(rootHash: string): Promise<Buffer> {
  const { mkdtemp, readFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");

  const indexer = new Indexer(STORAGE_INDEXER_URL);
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
