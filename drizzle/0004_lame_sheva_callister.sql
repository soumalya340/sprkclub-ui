-- Tracks the cumulative amount actually released to the creator, so the UI
-- can show a real deduction instead of only a "withdrawn" boolean.
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "withdrawn_amount" double precision DEFAULT 0 NOT NULL;
--> statement-breakpoint
-- Backfill: every row already marked withdrawn had exactly one tranche taken
-- (the first, capped at 20% of goal) under the old boolean-only logic.
UPDATE "proposals" SET "withdrawn_amount" = "funding_goal" * 0.2 WHERE "withdrawn" = true AND "withdrawn_amount" = 0;
