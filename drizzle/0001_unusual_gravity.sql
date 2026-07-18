CREATE TABLE "TurnSubstitute" (
	"id" text PRIMARY KEY NOT NULL,
	"turnId" text NOT NULL,
	"userId" text NOT NULL,
	"joinedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "TurnSubstitute_turnId_userId_key" UNIQUE("turnId","userId")
);
