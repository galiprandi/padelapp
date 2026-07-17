import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendPushToUser, getFirebaseInitError } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

/**
 * Temporary test endpoint to send a push notification to the logged-in user.
 * Usage: GET /api/push/test
 * Returns: { sent, subscriptions, error? }
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Check Firebase init
  const initError = getFirebaseInitError();
  if (initError) {
    return NextResponse.json({
      error: `Firebase not initialized: ${initError}`,
      sent: 0,
      subscriptions: 0,
    }, { status: 500 });
  }

  // Check subscriptions
  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subs.length === 0) {
    return NextResponse.json({
      error: "No push subscriptions found for this user. Grant notification permission first.",
      sent: 0,
      subscriptions: 0,
    }, { status: 404 });
  }

  const sent = await sendPushToUser(userId, {
    title: "🎾 PadelApp — Test",
    body: "Si ves esto, las notificaciones push funcionan!",
    url: "/me",
  });

  return NextResponse.json({
    sent,
    subscriptions: subs.length,
    tokens: subs.map((s) => s.endpoint.slice(0, 20) + "..."),
  });
}
