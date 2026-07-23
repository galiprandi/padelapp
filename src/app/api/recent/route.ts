import { NextResponse } from "next/server";
import { eq, desc, ne, and, isNotNull, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { matches, matchPlayers, users } from "@/db/schema";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Recent players: users who played in matches created by this user,
  // excluding the user themselves, ordered by most recent match.
  const recentPlayersRows = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      image: users.image,
      lastUsed: matchPlayers.createdAt,
    })
    .from(matchPlayers)
    .innerJoin(matches, eq(matchPlayers.matchId, matches.id))
    .innerJoin(users, eq(matchPlayers.userId, users.id))
    .where(
      and(
        eq(matches.creatorId, userId),
        ne(users.id, userId),
        isNotNull(matchPlayers.userId),
      ),
    )
    .orderBy(desc(matchPlayers.createdAt))
    .limit(20);

  // Deduplicate by user id, keep most recent
  const seen = new Set<string>();
  const recentPlayers = recentPlayersRows
    .filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    })
    .slice(0, 8)
    .map((row) => ({
      id: row.id,
      displayName: row.displayName,
      image: row.image,
    }));

  // Recent clubs: distinct club+court combinations from matches created by
  // this user, ordered by most recent first.
  const recentClubsRows = await db
    .select({
      club: matches.club,
      courtNumber: matches.courtNumber,
      lastUsed: matches.createdAt,
    })
    .from(matches)
    .where(
      and(
        eq(matches.creatorId, userId),
        isNotNull(matches.club),
        sql`${matches.club} != ''`,
      ),
    )
    .orderBy(desc(matches.createdAt))
    .limit(20);

  // Deduplicate by club+court combo, keep most recent
  const seenClubs = new Set<string>();
  const recentClubs = recentClubsRows
    .filter((row) => {
      if (!row.club) return false;
      const key = `${row.club}|${row.courtNumber ?? ""}`;
      if (seenClubs.has(key)) return false;
      seenClubs.add(key);
      return true;
    })
    .slice(0, 5)
    .map((row) => ({
      club: row.club as string,
      courtNumber: row.courtNumber ?? null,
    }));

  return NextResponse.json({
    recentPlayers,
    recentClubs,
  });
}
