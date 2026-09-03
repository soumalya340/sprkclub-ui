ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "network" text NOT NULL DEFAULT 'mainnet';
--> statement-breakpoint
UPDATE "proposals" SET "network" = 'testnet' WHERE "created_at" < 1788393600000;
