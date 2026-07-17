import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getMessaging, type Message } from "firebase-admin/messaging";
import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

let app: App | null = null;
let initError: string | null = null;

/**
 * Sanitize a Firebase private key from env vars.
 * Handles common paste issues:
 * - Literal "\n" strings (escaped newlines from JSON)
 * - Actual newlines (already correct)
 * - Whitespace/quotes wrapping from shell or Vercel UI
 * - Missing "-----BEGIN PRIVATE KEY-----" header
 */
function sanitizePrivateKey(raw: string): string {
  let key = raw.trim();

  // Strip surrounding quotes (Vercel sometimes wraps values)
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  // Convert literal "\n" to actual newlines
  key = key.replace(/\\n/g, "\n");

  // Normalize: remove any stray \r
  key = key.replace(/\r/g, "");

  // Collapse multiple consecutive newlines into one
  key = key.replace(/\n{2,}/g, "\n");

  // Trim each line (spaces around newlines can break the key)
  key = key
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  return key;
}

export function getFirebaseAdmin(): App | null {
  if (app) return app;
  if (initError) return null; // Don't retry after a failure
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    initError = "Missing Firebase env vars";
    return null;
  }

  const privateKey = sanitizePrivateKey(privateKeyRaw);

  // Basic validation — a real Firebase private key starts with this header
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    initError = `FIREBASE_PRIVATE_KEY is not a valid PEM key (missing header). Length: ${privateKey.length}, first 30 chars: ${privateKey.slice(0, 30)}...`;
    console.error(`[Firebase] ${initError}`);
    return null;
  }

  try {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    return app;
  } catch (error) {
    initError = `Failed to initialize Firebase: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`[Firebase] ${initError}`);
    return null;
  }
}

/**
 * Returns the initialization error if getFirebaseAdmin() returned null.
 * Useful for debugging push notification issues.
 */
export function getFirebaseInitError(): string | null {
  return initError;
}

export async function sendPushNotification(
  token: string,
  payload: {
    title: string;
    body: string;
    url?: string;
  }
): Promise<{ success: boolean; invalidToken?: boolean }> {
  const firebaseApp = getFirebaseAdmin();
  if (!firebaseApp) {
    const err = getFirebaseInitError();
    console.warn(`[Push] Firebase admin not configured — skipped. Reason: ${err ?? "unknown"}`);
    return { success: false };
  }

  try {
    const message: Message = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.url ? { url: payload.url } : {},
      webpush: {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        fcmOptions: payload.url
          ? { link: payload.url }
          : undefined,
      },
    };

    const response = await getMessaging(firebaseApp).send(message);
    return { success: !!response };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);

    // FCM error codes that indicate an invalid/expired token
    const isInvalidToken =
      errMsg.includes("UNREGISTERED") ||
      errMsg.includes("invalid-registration-token") ||
      errMsg.includes("registration-token-not-registered") ||
      errMsg.includes("Requested entity was not found");

    if (isInvalidToken) {
      console.warn(`[Push] Invalid/expired token detected, will clean up: ${token.slice(0, 20)}...`);
      return { success: false, invalidToken: true };
    }

    console.error(`[Push] Error sending notification:`, errMsg);
    return { success: false };
  }
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
): Promise<number> {
  const subscriptions = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  if (subscriptions.length === 0) return 0;

  let sent = 0;
  const staleTokenIds: string[] = [];

  for (const sub of subscriptions) {
    const result = await sendPushNotification(sub.endpoint, payload);
    if (result.success) {
      sent++;
    } else if (result.invalidToken) {
      staleTokenIds.push(sub.id);
    }
  }

  // Clean up stale tokens in bulk
  if (staleTokenIds.length > 0) {
    try {
      await db
        .delete(pushSubscriptions)
        .where(inArray(pushSubscriptions.id, staleTokenIds));
      console.log(`[Push] Cleaned up ${staleTokenIds.length} stale token(s) for user ${userId}`);
    } catch (error) {
      console.error(`[Push] Failed to clean up stale tokens:`, error);
    }
  }

  return sent;
}
