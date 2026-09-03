/**
 * Smoke: upload → download via shipped `uploadToStorage` / `downloadFromStorage`.
 *
 *   OG_SMOKE_SCRATCH=... node --env-file=.env.local --import tsx \
 *     --import ./scripts/smoke-hooks.mjs scripts/og-storage-smoke.mjs
 */
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const {
  uploadToStorage,
  downloadFromStorage,
} = await import("../src/lib/server/og-storage.ts");

const network =
  process.env.NEXT_PUBLIC_OG_NETWORK === "testnet" ? "testnet" : "mainnet";
const scratch =
  process.env.OG_SMOKE_SCRATCH || join(process.cwd(), ".og-smoke-out");
mkdirSync(scratch, { recursive: true });
const logPath = join(scratch, "og-storage-smoke.log");

function log(line) {
  const text = typeof line === "string" ? line : JSON.stringify(line);
  console.log(text);
  appendFileSync(logPath, text + "\n");
}

writeFileSync(logPath, ""); // truncate

const unique = `sprkclub-og-storage-smoke-${Date.now()}-${Math.random()
  .toString(16)
  .slice(2)}`;
const bytes = new TextEncoder().encode(unique);

log({ step: "start", network, bytes: bytes.length, unique });

const upload = await uploadToStorage(bytes, network);
log({
  step: "upload",
  rootHash: upload.rootHash,
  storageTxHash: upload.storageTxHash,
  alreadyStored: upload.alreadyStored,
  degraded: upload.degraded,
});

if (upload.degraded) {
  log("FAIL: upload returned degraded:true");
  process.exit(1);
}
if (!upload.rootHash) {
  log("FAIL: empty rootHash");
  process.exit(1);
}
if (!upload.alreadyStored && !upload.storageTxHash) {
  log("FAIL: missing storageTxHash for fresh upload");
  process.exit(1);
}

// Indexer needs a short settle window before the file is served.
await new Promise((r) => setTimeout(r, 10_000));

const downloaded = await downloadFromStorage(upload.rootHash, network);
const equal =
  downloaded.length === bytes.length &&
  Buffer.compare(Buffer.from(bytes), downloaded) === 0;

log({
  step: "download",
  bytes: downloaded.length,
  equal,
  preview: downloaded.toString("utf8").slice(0, 80),
});

if (!equal) {
  log("FAIL: downloaded bytes != uploaded bytes");
  process.exit(1);
}

log("PASS: og-storage upload/download round-trip");
writeFileSync(
  join(scratch, "og-storage-smoke-last.json"),
  JSON.stringify({ upload, equal, unique }, null, 2),
);
