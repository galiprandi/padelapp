import { NextResponse } from "next/server";
import { eq, desc, ne, and, isNotNull, isNull, sql, inArray, or, count } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { matches, matchPlayers, users, turns, playerEdges } from "@/db/schema";
import { normalizeClub, pickClubDisplayName } from "@/lib/club";

// Cached recent players + clubs per user, invalidated on match changes
const getCachedRecent = unstable_cache(
  async (userId: string) => {
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

    // --- Clubs: own recent (matches + turns) ---
    const [ownMatchClubs, ownTurnClubs] = await Promise.all([
      db
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
        .limit(20),
      db
        .select({
          club: turns.club,
          courtNumber: sql<string | null>`null`.as("courtNumber"),
          lastUsed: turns.createdAt,
        })
        .from(turns)
        .where(
          and(
            eq(turns.creatorId, userId),
            sql`${turns.club} != ''`,
          ),
        )
        .orderBy(desc(turns.createdAt))
        .limit(20),
    ]);

    // --- Clubs: network (contacts of the user via playerEdges) ---
    const edges = await db
      .select()
      .from(playerEdges)
      .where(
        or(
          eq(playerEdges.playerAId, userId),
          eq(playerEdges.playerBId, userId),
        ),
      );
    const contactIds = edges
      .map((e) => (e.playerAId === userId ? e.playerBId : e.playerAId))
      .filter((id) => id !== userId);

    let networkClubRows: { club: string | null; courtNumber: string | null }[] = [];
    if (contactIds.length > 0) {
      const [netMatchClubs, netTurnClubs] = await Promise.all([
        db
          .select({ club: matches.club, courtNumber: matches.courtNumber })
          .from(matches)
          .where(
            and(
              inArray(matches.creatorId, contactIds),
              isNotNull(matches.club),
              sql`${matches.club} != ''`,
            ),
          )
          .limit(50),
        db
          .select({
            club: turns.club,
            courtNumber: sql<string | null>`null`.as("courtNumber"),
          })
          .from(turns)
          .where(
            and(
              inArray(turns.creatorId, contactIds),
              sql`${turns.club} != ''`,
            ),
          )
          .limit(50),
      ]);
      networkClubRows = [...netMatchClubs, ...netTurnClubs];
    }

    // --- Clubs: global fallback (most used across all users) ---
    const [globalMatchClubs, globalTurnClubs] = await Promise.all([
      db
        .select({ club: matches.club, n: count() })
        .from(matches)
        .where(and(isNotNull(matches.club), sql`${matches.club} != ''`))
        .groupBy(matches.club)
        .orderBy(desc(count()))
        .limit(15),
      db
        .select({ club: turns.club, n: count() })
        .from(turns)
        .where(sql`${turns.club} != ''`)
        .groupBy(turns.club)
        .orderBy(desc(count()))
        .limit(15),
    ]);

    // Build ordered suggestion list:
    // 1. own recent (dedup by normalized key, keep court info)
    // 2. network clubs not already in own
    // 3. global clubs not already in own/network
    const ownAgg = new Map<
      string,
      { originals: string[]; court: string | null; lastUsed: Date | null }
    >();
    for (const row of [...ownMatchClubs, ...ownTurnClubs]) {
      const original = (row.club ?? "").trim();
      const key = normalizeClub(original);
      if (!key) continue;
      const entry = ownAgg.get(key) ?? { originals: [], court: null, lastUsed: null };
      if (original) entry.originals.push(original);
      if (row.courtNumber && !entry.court) entry.court = row.courtNumber;
      if (row.lastUsed && (!entry.lastUsed || row.lastUsed > entry.lastUsed)) {
        entry.lastUsed = row.lastUsed;
      }
      ownAgg.set(key, entry);
    }

    const networkAgg = new Map<string, { originals: string[]; court: string | null }>();
    for (const row of networkClubRows) {
      const original = (row.club ?? "").trim();
      const key = normalizeClub(original);
      if (!key || ownAgg.has(key)) continue;
      const entry = networkAgg.get(key) ?? { originals: [], court: null };
      if (original) entry.originals.push(original);
      if (row.courtNumber && !entry.court) entry.court = row.courtNumber;
      networkAgg.set(key, entry);
    }

    const globalAgg = new Map<string, { originals: string[] }>();
    for (const row of [...globalMatchClubs, ...globalTurnClubs]) {
      const original = (row.club ?? "").trim();
      const key = normalizeClub(original);
      if (!key || ownAgg.has(key) || networkAgg.has(key)) continue;
      const entry = globalAgg.get(key) ?? { originals: [] };
      if (original) entry.originals.push(original);
      globalAgg.set(key, entry);
    }

    const buildClubSuggestion = (
      originals: string[],
      court: string | null,
    ) => {
      const name = pickClubDisplayName(originals);
      return court ? { club: name, courtNumber: court } : { club: name, courtNumber: null };
    };

    const recentClubs = [
      ...Array.from(ownAgg.entries())
        .sort((a, b) => (b[1].lastUsed?.getTime() ?? 0) - (a[1].lastUsed?.getTime() ?? 0))
        .slice(0, 5)
        .map(([, e]) => buildClubSuggestion(e.originals, e.court)),
      ...Array.from(networkAgg.entries())
        .slice(0, 5)
        .map(([, e]) => buildClubSuggestion(e.originals, e.court)),
      ...Array.from(globalAgg.entries())
        .slice(0, 5)
        .map(([, e]) => buildClubSuggestion(e.originals, null)),
    ];

    return { recentPlayers, recentClubs };
  },
  ["recent-players-clubs"],
  { revalidate: 60, tags: ["matches"] },
);

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getCachedRecent(session.user.id);
  return NextResponse.json(data);
}
