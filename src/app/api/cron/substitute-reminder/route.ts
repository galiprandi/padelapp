import { NextResponse } from "next/server";
import { db } from "@/db";
import { turns, turnSubstitutes } from "@/db/schema";
import { and, gte, lte, inArray, asc } from "drizzle-orm";
import { notifyUsers } from "@/lib/notifications";
import { getTurnLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Runs every hour via Vercel Cron.
// Sends a reminder to substitutes of turns happening in the next 24h.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  try {
    const upcomingTurns = await db.query.turns.findMany({
      where: and(
        gte(turns.date, now),
        lte(turns.date, in24h),
        inArray(turns.status, ["OPEN", "FULL"]),
      ),
      with: {
        substitutes: {
          with: {
            user: { columns: { id: true } },
          },
        },
      },
      orderBy: asc(turns.date),
    });

    let notified = 0;

    for (const turn of upcomingTurns) {
      if (turn.substitutes.length === 0) continue;

      const substituteIds = turn.substitutes.map((s) => s.userId);
      const turnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${turn.id}`;

      await notifyUsers(substituteIds, {
        title: `Recordatorio: sos suplente en ${getTurnLabel(turn.club, turn.date)}`,
        body: `¿Seguís disponible?`,
        url: turnUrl,
      });

      notified += substituteIds.length;
    }

    return NextResponse.json({
      ok: true,
      turnsChecked: upcomingTurns.length,
      substitutesNotified: notified,
    });
  } catch (error) {
    console.error("Error in substitute reminder cron:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send reminders" },
      { status: 500 },
    );
  }
}
