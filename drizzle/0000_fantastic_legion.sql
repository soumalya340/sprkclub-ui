CREATE TABLE "backers" (
	"proposal_id" text NOT NULL,
	"address" text NOT NULL,
	"minted" integer DEFAULT 0 NOT NULL,
	"amount" double precision DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "backers_proposal_id_address_pk" PRIMARY KEY("proposal_id","address")
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" text PRIMARY KEY NOT NULL,
	"proposal_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"proof" text DEFAULT '' NOT NULL,
	"root_hash" text,
	"chain_tx_hash" text,
	"milestone_index" integer,
	"status" text DEFAULT 'submitted' NOT NULL,
	"submitted_at" bigint NOT NULL,
	"reviewed_at" bigint,
	"reviewed_by" text,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"cover" text NOT NULL,
	"price_per_nft" double precision NOT NULL,
	"funding_goal" double precision NOT NULL,
	"type" text NOT NULL,
	"valid_till" text NOT NULL,
	"creator" text NOT NULL,
	"created_at" bigint NOT NULL,
	"status" text NOT NULL,
	"stablecoin" text NOT NULL,
	"start_date" text,
	"end_date" text,
	"staked" boolean DEFAULT false NOT NULL,
	"total_funding" double precision DEFAULT 0 NOT NULL,
	"minted_count" integer DEFAULT 0 NOT NULL,
	"withdrawn" boolean DEFAULT false NOT NULL,
	"disputed_by" text,
	"dispute_reason" text,
	"contract_address" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"proposal_id" text NOT NULL,
	"voter" text NOT NULL,
	"kind" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "votes_proposal_id_voter_pk" PRIMARY KEY("proposal_id","voter")
);
--> statement-breakpoint
ALTER TABLE "backers" ADD CONSTRAINT "backers_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "milestones_proposal_idx" ON "milestones" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "proposals_creator_idx" ON "proposals" USING btree ("creator");