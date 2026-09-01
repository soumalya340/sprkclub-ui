ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "project_twitter" text;
--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "creator_twitter" text;
--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "project_instagram" text;
--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "creator_instagram" text;
--> statement-breakpoint
UPDATE "proposals" SET "type" = 'project' WHERE "type" = 'collab';
--> statement-breakpoint
UPDATE "proposals" SET "type" = 'creative-work' WHERE "type" = 'holder';
