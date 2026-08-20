import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export interface DashboardUserStats {
  id: string;
  displayName: string;
  alias: string | null;
  level: number;
  rankingScore: number;
  rankingPosition: number | null;
  rankingDelta: number | null;
  matchesPlayed: number;
  wins: number;
  losses: number;
  image: string | null;
  attendanceScore: number;
}

/**
 * Get the current user's stats for the dashboard hero.
 * Used by /me page.
 */
export async function getDashboardUserStats(userId: string): Promise<DashboardUserStats | null> {
  if (process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true") {
    return {
      id: "p-01",
      displayName: "Agustín",
      alias: "agu",
      level: 6,
      rankingScore: 1150,
      rankingPosition: 2,
      rankingDelta: 1,
      matchesPlayed: 15,
      wins: 10,
      losses: 5,
      image: null,
      attendanceScore: 1.0,
    };
  }
  const [user] = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      alias: users.alias,
      level: users.level,
      rankingScore: users.rankingScore,
      rankingPosition: users.rankingPosition,
      rankingDelta: users.rankingDelta,
      matchesPlayed: users.matchesPlayed,
      wins: users.wins,
      losses: users.losses,
      image: users.image,
      attendanceScore: users.attendanceScore,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

/**
 * Cached version of getDashboardUserStats.
 * Keyed by userId. Invalidated by revalidateTag("ranking").
 * Fallback revalidate: 60s.
 */
export const getCachedDashboardUserStats = (userId: string) =>
  unstable_cache(
    async () => getDashboardUserStats(userId),
    ["dashboard-user-stats", userId],
    { tags: ["ranking"], revalidate: 60 }
  )();
