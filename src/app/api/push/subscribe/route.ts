import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

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

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
