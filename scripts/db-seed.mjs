// Seeds Neon with the demo proposals from src/lib/seed.ts.
// Safe to re-run: existing proposal ids are skipped, so live data is preserved.
//
// Rows are seeded onto one network at a time. Pass the network as the first
// argument (default "testnet") — ids are suffixed per network so the same demo
// set can exist on both without colliding:
//   node scripts/db-seed.mjs testnet
//   node scripts/db-seed.mjs mainnet
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const sql = neon(process.env.DATABASE_URL ?? process.env.POSTGRES_URL);

// seed.ts is TypeScript; strip the types by evaluating just the data literals.
const source = readFileSync("src/lib/seed.ts", "utf8");
const consts = Object.fromEntries(
  [...source.matchAll(/export const (\w+) = "(0x[0-9a-fA-F]+)"/g)].map((m) => [m[1], m[2]]),
);
const arrayBody = source.slice(
  source.indexOf("export const SEED_PROPOSALS"),
);
const literal = arrayBody.slice(arrayBody.indexOf("["), arrayBody.lastIndexOf("];") + 1);

const T = (iso) => new Date(iso).getTime();
const proposals = new Function(
  ...Object.keys(consts),
  "T",
  `return ${literal.replace(/\s*as\s+\w+/g, "")}`,
)(...Object.values(consts), T);

const network = process.argv[2] ?? "testnet";
if (network !== "testnet" && network !== "mainnet") {
  throw new Error(`Unknown network "${network}" — use "testnet" or "mainnet"`);
}

const lower = (a) => String(a).toLowerCase();
// Mainnet copies get a suffixed id so both networks can hold the demo set.
const idFor = (id) => (network === "testnet" ? id : `${id}-${network}`);
let inserted = 0;

for (const raw of proposals) {
  const p = { ...raw, id: idFor(raw.id) };
  const existing = await sql`select id from proposals where id = ${p.id}`;
  if (existing.length) continue;

  await sql`
    insert into proposals (
      id, title, description, cover, price_per_nft, funding_goal, type,
      valid_till, creator, created_at, status, stablecoin, start_date, end_date,
      staked, total_funding, minted_count, withdrawn, disputed_by, dispute_reason,
      network
    ) values (
      ${p.id}, ${p.title}, ${p.description}, ${p.cover}, ${p.pricePerNft},
      ${p.fundingGoal}, ${p.type}, ${p.validTill}, ${lower(p.creator)},
      ${p.createdAt}, ${p.status}, ${p.stablecoin}, ${p.startDate ?? null},
      ${p.endDate ?? null}, ${p.staked}, ${p.totalFunding}, ${p.mintedCount},
      ${p.withdrawn}, ${p.disputedBy ? lower(p.disputedBy) : null},
      ${p.disputeReason ?? null}, ${network}
    )`;

  for (const [voter, kind] of Object.entries(p.voters ?? {})) {
    await sql`insert into votes (proposal_id, voter, kind)
              values (${p.id}, ${lower(voter)}, ${kind})
              on conflict do nothing`;
  }
  for (const b of p.backers ?? []) {
    await sql`insert into backers (proposal_id, address, minted, amount)
              values (${p.id}, ${lower(b.address)}, ${b.minted}, ${b.amount})
              on conflict do nothing`;
  }
  for (const m of p.milestones ?? []) {
    await sql`insert into milestones (id, proposal_id, title, description, proof, status, submitted_at, reviewed_at)
              values (${idFor(m.id)}, ${p.id}, ${m.title}, ${m.description}, ${m.proof},
                      ${m.status}, ${m.submittedAt}, ${m.reviewedAt ?? null})
              on conflict do nothing`;
  }
  inserted++;
}

const [{ count }] = await sql`
  select count(*)::int as count from proposals where network = ${network}`;
console.log(`seeded ${inserted} new proposal(s) on ${network}; ${count} total there`);
