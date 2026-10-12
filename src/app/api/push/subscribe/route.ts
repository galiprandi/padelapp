import { NextRequest, NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import {
  validatePushSubscribePayload,
  getPushSubscribeUnauthorizedResponseBody,
  getPushSubscribeBadRequestResponseBody,
  getPushSubscribeSuccessResponseBody,
  getPushSubscribeErrorResponseBody,
} from "./subscribe-utils";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      getPushSubscribeUnauthorizedResponseBody(),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const validation = validatePushSubscribePayload(body);

    if (!validation.isValid || !validation.token) {
      return NextResponse.json(
        getPushSubscribeBadRequestResponseBody(validation.error),
        { status: 400 }
      );
    }

    const { token } = validation;

    // Clean up any stale mappings where this token is assigned to other users
    await db
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.endpoint, token),
          ne(pushSubscriptions.userId, session.user.id)
        )
      );

    await db
      .insert(pushSubscriptions)
      .values({
        userId: session.user.id,
        endpoint: token,
        keys: {},
      })
      .onConflictDoUpdate({
        target: [pushSubscriptions.userId, pushSubscriptions.endpoint],
        set: { endpoint: token },
      });

    return NextResponse.json(getPushSubscribeSuccessResponseBody());
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json(
      getPushSubscribeErrorResponseBody(),
      { status: 500 }
    );
  }
}
