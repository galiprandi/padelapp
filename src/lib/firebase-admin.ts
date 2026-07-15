import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getMessaging, type Message } from "firebase-admin/messaging";

let app: App | null = null;

export function getFirebaseAdmin(): App | null {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });

  return app;
}

export async function sendPushNotification(
  token: string,
  payload: {
    title: string;
    body: string;
    url?: string;
  }
): Promise<boolean> {
  const firebaseApp = getFirebaseAdmin();
  if (!firebaseApp) {
    console.warn("Firebase admin not configured — push notification skipped");
    return false;
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
    return !!response;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
): Promise<number> {
  const { prisma } = await import("@/lib/prisma");
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) return 0;

  let sent = 0;
  for (const sub of subscriptions) {
    const success = await sendPushNotification(sub.endpoint, payload);
    if (success) sent++;
  }
  return sent;
}
