// Applies the generated Drizzle SQL to Neon. Idempotent: statements are
// CREATE TABLE / ALTER TABLE and re-runs are skipped once the tables exist.
import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const sql = neon(process.env.DATABASE_URL ?? process.env.POSTGRES_URL);
const dir = "drizzle";

for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  const body = readFileSync(join(dir, file), "utf8");
  const statements = body
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    try {
      await sql.query(statement);
    } catch (error) {
      // Re-running a migration is expected; anything else is a real failure.
      if (/already exists/i.test(error.message)) continue;
      throw new Error(`${file}: ${error.message}\n${statement.slice(0, 120)}`);
    }
  }
  console.log(`applied ${file} (${statements.length} statements)`);
}
