import { db } from "@/db";
import { users, accounts, playerGraphStats, playerEdges } from "@/db/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";

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
  lastMatchAt: Date | null;
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
      lastMatchAt: users.lastMatchAt,
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

export interface PlayerNetworkStats {
  preferredSide: "RIGHT" | "LEFT" | null;
  winRateRight: number | null;
  winRateLeft: number | null;
  networkSize: number;
  community: number | null;
  frequentRival: {
    user: {
      id: string;
      displayName: string;
      alias: string | null;
      image: string | null;
    } | null;
    matches: number;
  } | null;
  successfulPartner: {
    user: {
      id: string;
      displayName: string;
      alias: string | null;
      image: string | null;
    } | null;
    wins: number;
  } | null;
}

/**
 * Get a user's network and position statistics computed by the graph engine.
 */
export async function getPlayerNetworkStats(userId: string): Promise<PlayerNetworkStats> {
  const [stats] = await db
    .select({
      preferredSide: playerGraphStats.preferredSide,
      winRateRight: playerGraphStats.winRateRight,
      winRateLeft: playerGraphStats.winRateLeft,
      networkSize: playerGraphStats.networkSize,
      community: playerGraphStats.community,
    })
    .from(playerGraphStats)
    .where(eq(playerGraphStats.userId, userId))
    .limit(1);

  // 1. Find frequent rival
  const [frequentRivalEdge] = await db
    .select()
    .from(playerEdges)
    .where(
      and(
        or(
          eq(playerEdges.playerAId, userId),
          eq(playerEdges.playerBId, userId),
        ),
        sql`${playerEdges.matchesAsRivals} > 0`,
      )
    )
    .orderBy(desc(playerEdges.matchesAsRivals))
    .limit(1);

  let frequentRival: PlayerNetworkStats["frequentRival"] = null;
  if (frequentRivalEdge) {
    const rivalId = frequentRivalEdge.playerAId === userId ? frequentRivalEdge.playerBId : frequentRivalEdge.playerAId;
    const [rivalUser] = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        alias: users.alias,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, rivalId))
      .limit(1);

    if (rivalUser) {
      frequentRival = {
        user: rivalUser,
        matches: frequentRivalEdge.matchesAsRivals,
      };
    }
  }

  // 2. Find most successful partner
  const [successfulPartnerEdge] = await db
    .select()
    .from(playerEdges)
    .where(
      and(
        or(
          eq(playerEdges.playerAId, userId),
          eq(playerEdges.playerBId, userId),
        ),
        sql`${playerEdges.winsTogether} > 0`,
      )
    )
    .orderBy(desc(playerEdges.winsTogether), desc(playerEdges.matchesAsPartners))
    .limit(1);

  let successfulPartner: PlayerNetworkStats["successfulPartner"] = null;
  if (successfulPartnerEdge) {
    const partnerId = successfulPartnerEdge.playerAId === userId ? successfulPartnerEdge.playerBId : successfulPartnerEdge.playerAId;
    const [partnerUser] = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        alias: users.alias,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, partnerId))
      .limit(1);

    if (partnerUser) {
      successfulPartner = {
        user: partnerUser,
        wins: successfulPartnerEdge.winsTogether,
      };
    }
  }

  return {
    preferredSide: (stats?.preferredSide as "RIGHT" | "LEFT" | null) ?? null,
    winRateRight: stats?.winRateRight ?? null,
    winRateLeft: stats?.winRateLeft ?? null,
    networkSize: stats?.networkSize ?? 0,
    community: stats?.community ?? null,
    frequentRival,
    successfulPartner,
  };
}
