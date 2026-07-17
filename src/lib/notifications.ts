import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { sendPushToUser } from "@/lib/firebase-admin";

/**
 * Send a push notification to multiple users.
 * Returns the number of users who received at least one notification.
 */
export async function notifyUsers(
  userIds: string[],
  payload: { title: string; body: string; url?: string },
): Promise<number> {
  let sent = 0;
  for (const userId of userIds) {
    const success = await sendPushToUser(userId, payload);
    if (success > 0) sent++;
  }
  return sent;
}

/**
 * Get a user's display name (alias preferred, fallback to displayName).
 */
export async function getUserDisplayName(userId: string): Promise<string> {
  const [user] = await db
    .select({ alias: users.alias, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user?.alias ?? user?.displayName ?? "Un jugador";
}
