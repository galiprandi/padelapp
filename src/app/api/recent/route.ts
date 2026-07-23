import { NextResponse } from "next/server";
import { eq, desc, ne, and, isNotNull, isNull, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { matches, matchPlayers, users } from "@/db/schema";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Recent players — two sources merged by recency:
  // 1. Google users (matchPlayers.userId IS NOT NULL)
  // 2. Placeholder names (matchPlayers.userId IS NULL, displayName IS NOT NULL)
  const [userRows, placeholderRows] = await Promise.all([
    db
      .select({
        id: users.id,
        displayName: users.displayName,
        image: users.image,
        lastUsed: matchPlayers.createdAt,
        isUser: sql`true`.as("isUser"),
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
      .limit(20),
    db
      .select({
        id: matchPlayers.id,
        displayName: matchPlayers.displayName,
        image: sql<string | null>`null`.as("image"),
        lastUsed: matchPlayers.createdAt,
        isUser: sql`false`.as("isUser"),
      })
      .from(matchPlayers)
      .innerJoin(matches, eq(matchPlayers.matchId, matches.id))
      .where(
        and(
          eq(matches.creatorId, userId),
          isNull(matchPlayers.userId),
          isNotNull(matchPlayers.displayName),
          sql`${matchPlayers.displayName} != ''`,
        ),
      )
      .orderBy(desc(matchPlayers.createdAt))
      .limit(20),
  ]);

  // Merge both sources, deduplicate by name, keep most recent
  const merged = [...userRows, ...placeholderRows].sort(
    (a, b) => (b.lastUsed?.getTime() ?? 0) - (a.lastUsed?.getTime() ?? 0),
  );

  const seen = new Set<string>();
  const recentPlayers = merged
    .filter((row) => {
      const key = (row.displayName ?? "").toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8)
    .map((row) => ({
      id: row.id,
      displayName: row.displayName,
      image: row.image,
      isUser: row.isUser,
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
