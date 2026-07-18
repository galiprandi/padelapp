CREATE TYPE "public"."FeedbackType" AS ENUM('STRONGER', 'WEAKER');--> statement-breakpoint
CREATE TYPE "public"."PlayerSide" AS ENUM('RIGHT', 'LEFT');--> statement-breakpoint
CREATE TABLE "MatchPlayerFeedback" (
	"id" text PRIMARY KEY NOT NULL,
	"matchId" text NOT NULL,
	"playerId" text NOT NULL,
	"feedbackBy" text NOT NULL,
	"feedback" "FeedbackType" NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "MatchPlayerFeedback_match_player_by_key" UNIQUE("matchId","playerId","feedbackBy")
);
--> statement-breakpoint
CREATE TABLE "PlayerEdge" (
	"id" text PRIMARY KEY NOT NULL,
	"playerAId" text NOT NULL,
	"playerBId" text NOT NULL,
	"matchesAsRivals" integer DEFAULT 0 NOT NULL,
	"matchesAsPartners" integer DEFAULT 0 NOT NULL,
	"winsA" integer DEFAULT 0 NOT NULL,
	"winsB" integer DEFAULT 0 NOT NULL,
	"winsTogether" integer DEFAULT 0 NOT NULL,
	"lossesTogether" integer DEFAULT 0 NOT NULL,
	"lastMatchAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	CONSTRAINT "PlayerEdge_playerA_playerB_key" UNIQUE("playerAId","playerBId")
);
--> statement-breakpoint
CREATE TABLE "PlayerGraphStats" (
	"userId" text PRIMARY KEY NOT NULL,
	"skillScore" double precision DEFAULT 1000 NOT NULL,
	"community" integer,
	"networkSize" integer DEFAULT 0 NOT NULL,
	"preferredSide" "PlayerSide",
	"winRateRight" double precision,
	"winRateLeft" double precision,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "MatchPlayer" ADD COLUMN "side" "PlayerSide";