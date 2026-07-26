ALTER TABLE "PlayerEdge" ADD COLUMN "turnsTogether" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "PlayerEdge" ADD COLUMN "lastTurnAt" timestamp (3);