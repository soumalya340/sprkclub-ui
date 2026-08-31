// One-off: flip proposals stuck at status "voting" to "passed" if they
// already have >=55% support (1+ votes), mirroring the retally now run
// inside castVote() for every new vote. Needed because that fix only runs
// going forward — proposals that passed before the fix never got re-checked.
//
// Run: node --env-file=.env scripts/backfill-passed-proposals.mjs
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL ?? process.env.POSTGRES_URL);

const rows = await sql`
  select p.id, p.title,
    count(*) filter (where v.kind = 'like') as likes,
    count(*) as total
  from proposals p
  join votes v on v.proposal_id = p.id
  where p.status = 'voting'
  group by p.id, p.title
`;

let updated = 0;
for (const row of rows) {
  const total = Number(row.total);
  const likes = Number(row.likes);
  const share = total > 0 ? (likes / total) * 100 : 0;
  if (total >= 1 && share >= 55) {
    await sql`
      update proposals
      set status = 'passed', updated_at = now()
      where id = ${row.id} and status = 'voting'
    `;
    console.log(`passed: ${row.title} (${row.id}) — ${likes}/${total} = ${share.toFixed(0)}%`);
    updated++;
  }
}

console.log(`Done. Updated ${updated} proposal(s).`);
