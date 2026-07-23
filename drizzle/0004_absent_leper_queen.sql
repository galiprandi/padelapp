CREATE INDEX "MatchPlayer_userId_idx" ON "MatchPlayer" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Match_creatorId_idx" ON "Match" USING btree ("creatorId");