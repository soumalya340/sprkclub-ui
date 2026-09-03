/**
 * Smoke: evaluateMilestone via shipped og-compute (Router → Direct → never treat fallback as pass).
 *
 *   OG_SMOKE_SCRATCH=... node --env-file=.env.local --import tsx \
 *     --import ./scripts/smoke-hooks.mjs scripts/og-compute-smoke.mjs
 */
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const { evaluateMilestone } = await import("../src/lib/server/og-compute.ts");

const network =
  process.env.NEXT_PUBLIC_OG_NETWORK === "testnet" ? "testnet" : "mainnet";
const scratch =
  process.env.OG_SMOKE_SCRATCH || join(process.cwd(), ".og-smoke-out");
mkdirSync(scratch, { recursive: true });
const logPath = join(scratch, "og-compute-smoke.log");

function log(line) {
  const text = typeof line === "string" ? line : JSON.stringify(line);
  console.log(text);
  appendFileSync(logPath, text + "\n");
}

writeFileSync(logPath, "");

const ctx = {
  proposalTitle: "0G Compute Smoke Proposal",
  proposalDescription:
    "Deliver a short written milestone proof that the storage and compute path works.",
  milestoneTitle: "Smoke milestone",
  milestoneAcceptance:
    "Proof text clearly describes a completed smoke test with concrete steps.",
  proofText: [
    "Milestone proof for smoke evaluation.",
    "We uploaded unique bytes to 0G Storage, retrieved the same root, and confirmed byte equality.",
    "This paragraph is intentionally longer than eighty characters so the fallback heuristic is not the only possible pass path.",
    "Acceptance: storage round-trip documented; compute scorecard expected from live 0G inference.",
  ].join("\n"),
  proofRootHash: "0xsmoke",
};

log({ step: "start", network, title: ctx.proposalTitle });

const scorecard = await evaluateMilestone(ctx, network);
log({
  step: "evaluate",
  provider: scorecard.provider,
  model: scorecard.model,
  pass: scorecard.pass,
  overallScore: scorecard.overallScore,
  summary: scorecard.summary,
  risks: scorecard.risks?.slice?.(0, 3),
});

if (scorecard.provider !== "0g-compute") {
  log(`FAIL: provider=${scorecard.provider} (expected 0g-compute)`);
  process.exit(1);
}
if (!scorecard.model || scorecard.model.startsWith("fallback:")) {
  log(`FAIL: empty/fallback model=${scorecard.model}`);
  process.exit(1);
}
if (!scorecard.summary || !String(scorecard.summary).trim()) {
  log("FAIL: empty summary");
  process.exit(1);
}

log("PASS: og-compute evaluateMilestone returned live 0g-compute scorecard");
writeFileSync(
  join(scratch, "og-compute-smoke-last.json"),
  JSON.stringify(scorecard, null, 2),
);
