CREATE TYPE "public"."AttendanceStatus" AS ENUM('ATTENDED', 'LATE', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "public"."MatchStatus" AS ENUM('PENDING', 'CONFIRMED', 'DISPUTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."MatchType" AS ENUM('FRIENDLY', 'LOCAL_TOURNAMENT');--> statement-breakpoint
CREATE TYPE "public"."TurnStatus" AS ENUM('OPEN', 'FULL', 'CANCELLED', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "Account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "MatchPlayer" (
	"id" text PRIMARY KEY NOT NULL,
	"matchId" text NOT NULL,
	"userId" text,
	"position" integer NOT NULL,
	"resultConfirmed" boolean DEFAULT false NOT NULL,
	"displayName" text,
	"teamId" text,
	"joinedAt" timestamp (3),
	"attendance" "AttendanceStatus",
	"attendanceBy" text,
	"attendanceAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	CONSTRAINT "MatchPlayer_matchId_position_key" UNIQUE("matchId","position"),
	CONSTRAINT "MatchPlayer_matchId_userId_key" UNIQUE("matchId","userId")
);
--> statement-breakpoint
CREATE TABLE "Match" (
	"id" text PRIMARY KEY NOT NULL,
	"creatorId" text NOT NULL,
	"status" "MatchStatus" DEFAULT 'PENDING' NOT NULL,
	"date" timestamp (3) DEFAULT now() NOT NULL,
	"sets" integer DEFAULT 2 NOT NULL,
	"matchType" "MatchType" DEFAULT 'FRIENDLY' NOT NULL,
	"club" text,
	"courtNumber" text,
	"score" text,
	"notes" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"turnId" text
);
--> statement-breakpoint
CREATE TABLE "PushSubscription" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"endpoint" text NOT NULL,
	"keys" json NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "PushSubscription_userId_endpoint_key" UNIQUE("userId","endpoint")
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp (3) NOT NULL,
	CONSTRAINT "Session_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "Team" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TurnPlayer" (
	"id" text PRIMARY KEY NOT NULL,
	"turnId" text NOT NULL,
	"userId" text NOT NULL,
	"joinedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "TurnPlayer_turnId_userId_key" UNIQUE("turnId","userId")
);
--> statement-breakpoint
CREATE TABLE "Turn" (
	"id" text PRIMARY KEY NOT NULL,
	"creatorId" text NOT NULL,
	"club" text NOT NULL,
	"date" timestamp (3) NOT NULL,
	"duration" integer DEFAULT 90 NOT NULL,
	"maxPlayers" integer DEFAULT 4 NOT NULL,
	"suggestedLevel" integer DEFAULT 6 NOT NULL,
	"notes" text,
	"status" "TurnStatus" DEFAULT 'OPEN' NOT NULL,
	"lastNetworkNotificationAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"displayName" text NOT NULL,
	"alias" text,
	"email" text NOT NULL,
	"image" text,
	"level" integer DEFAULT 6 NOT NULL,
	"emailVerified" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"attendanceScore" double precision DEFAULT 1 NOT NULL,
	"lastMatchAt" timestamp (3),
	"losses" integer DEFAULT 0 NOT NULL,
	"matchesPlayed" integer DEFAULT 0 NOT NULL,
	"rankingDelta" integer DEFAULT 0 NOT NULL,
	"rankingPosition" integer,
	"rankingScore" double precision DEFAULT 1000 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "VerificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp (3) NOT NULL,
	CONSTRAINT "VerificationToken_token_unique" UNIQUE("token"),
	CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE("identifier","token")
);
