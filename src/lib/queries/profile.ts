import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

/**
 * Get the original Google avatar URL from the id_token stored in the Account table.
 */
export async function getGoogleAvatarUrl(userId: string): Promise<string | null> {
  try {
    const [googleAccount] = await db
      .select({
        idToken: accounts.id_token,
      })
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, userId),
          eq(accounts.provider, "google"),
        )
      )
      .limit(1);

    if (!googleAccount?.idToken) {
      return null;
    }

    const parts = googleAccount.idToken.split(".");
    if (parts.length < 2) {
      return null;
    }

    const payload = parts[1];
    // Decode base64url payload
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    const decoded = JSON.parse(jsonPayload);

    return decoded.picture ?? null;
  } catch (error) {
    console.error("Error getting google avatar url:", error);
    return null;
  }
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
