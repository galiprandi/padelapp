import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface DashboardUserStats {
  id: string;
  displayName: string;
  alias: string | null;
  rankingScore: number;
  rankingPosition: number | null;
  rankingDelta: number | null;
  level: number;
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
  const [user] = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      alias: users.alias,
      rankingScore: users.rankingScore,
      rankingPosition: users.rankingPosition,
      rankingDelta: users.rankingDelta,
      level: users.level,
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
