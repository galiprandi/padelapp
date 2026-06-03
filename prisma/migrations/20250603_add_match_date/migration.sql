-- Add missing fields to Match table
ALTER TABLE "Match" ADD COLUMN "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add missing fields to User table (ranking metrics)
ALTER TABLE "User" ADD COLUMN "attendanceScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0;
ALTER TABLE "User" ADD COLUMN "lastMatchAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "losses" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "matchesPlayed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "rankingDelta" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "rankingPosition" INTEGER;
ALTER TABLE "User" ADD COLUMN "rankingScore" DOUBLE PRECISION NOT NULL DEFAULT 1000;
ALTER TABLE "User" ADD COLUMN "wins" INTEGER NOT NULL DEFAULT 0;

-- Create TurnStatus enum
CREATE TYPE "TurnStatus" AS ENUM ('OPEN', 'FULL', 'CANCELLED', 'COMPLETED');

-- Create Turn table
CREATE TABLE "Turn" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "club" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 90,
    "maxPlayers" INTEGER NOT NULL DEFAULT 4,
    "suggestedLevel" INTEGER NOT NULL DEFAULT 6,
    "notes" TEXT,
    "status" "TurnStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turn_pkey" PRIMARY KEY ("id")
);

-- Create TurnPlayer table
CREATE TABLE "TurnPlayer" (
    "id" TEXT NOT NULL,
    "turnId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TurnPlayer_pkey" PRIMARY KEY ("id")
);

-- Add turnId to Match table
ALTER TABLE "Match" ADD COLUMN "turnId" TEXT;

-- Add foreign key for turnId
ALTER TABLE "Match" ADD CONSTRAINT "Match_turnId_fkey" FOREIGN KEY ("turnId") REFERENCES "Turn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key for Turn creator
ALTER TABLE "Turn" ADD CONSTRAINT "Turn_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add foreign keys for TurnPlayer
ALTER TABLE "TurnPlayer" ADD CONSTRAINT "TurnPlayer_turnId_fkey" FOREIGN KEY ("turnId") REFERENCES "Turn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TurnPlayer" ADD CONSTRAINT "TurnPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique index for TurnPlayer
CREATE UNIQUE INDEX "TurnPlayer_turnId_userId_key" ON "TurnPlayer"("turnId", "userId");
