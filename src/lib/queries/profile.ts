import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface PublicProfileUser {
  id: string;
  displayName: string;
  alias: string | null;
  image: string | null;
  level: number;
  rankingScore: number;
  rankingPosition: number | null;
  rankingDelta: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
}

/**
 * Get a user's public profile data (for /p/[userId] page).
 */
export async function getPublicProfileUser(userId: string): Promise<PublicProfileUser | null> {
  const [user] = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      alias: users.alias,
      image: users.image,
      level: users.level,
      rankingScore: users.rankingScore,
      rankingPosition: users.rankingPosition,
      rankingDelta: users.rankingDelta,
      wins: users.wins,
      losses: users.losses,
      matchesPlayed: users.matchesPlayed,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

export interface EditableProfileData {
  displayName: string;
  alias: string | null;
  level: number;
  image: string | null;
  email: string;
}

/**
 * Get the current user's editable profile data (for /me/profile page).
 */
export async function getEditableProfile(userId: string): Promise<EditableProfileData | null> {
  const [user] = await db
    .select({
      displayName: users.displayName,
      alias: users.alias,
      level: users.level,
      image: users.image,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}
