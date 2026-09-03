-- 0G Compute audit mirrored onto each milestone row.
--
-- The scorecard itself stays on 0G Storage and the authoritative audit root
-- stays on chain; these columns let a campaign page list its milestones without
-- a chain read plus a Storage fetch per row. All nullable: the first tranche is
-- drawn with no proof, so it is never graded and never gets an audit root.
--
-- The proposals columns drizzle-kit also wanted here are omitted deliberately —
-- 0001 and 0002 already added them by hand, and the generator's snapshot had
-- not caught up.
ALTER TABLE "milestones" ADD COLUMN IF NOT EXISTS "audit_root_hash" text;
--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN IF NOT EXISTS "audit_tx_hash" text;
--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN IF NOT EXISTS "audit_recorded_at" bigint;
--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN IF NOT EXISTS "audit_provider" text;
--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN IF NOT EXISTS "audit_score" integer;
