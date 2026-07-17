import { NextResponse } from "next/server";
import { and, eq, ilike, ne, or } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getPadelContacts } from "@/lib/queries";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";

  // Get padel contacts (always useful for prioritization or empty state)
  const contacts = await getPadelContacts(session.user.id);

  if (query.length === 0) {
    // Return top 10 recent contacts
    return NextResponse.json({
      players: contacts.slice(0, 10).map((player) => ({
        id: player.id,
        displayName: player.displayName,
        email: "", // Hide email in suggestions for privacy if not searched
        image: player.image,
        isContact: true,
      })),
    });
  }

  // Search globally
  const globalPlayers = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      alias: users.alias,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(
      and(
        ne(users.id, session.user.id),
        or(
          ilike(users.displayName, `%${query}%`),
          ilike(users.email, `%${query}%`),
          ilike(users.alias, `%${query}%`),
        ),
      ),
    )
    .orderBy(users.displayName)
    .limit(20);

  // Merge and prioritize contacts
  const contactIds = new Set(contacts.map((c) => c.id));

  const merged = [
    ...contacts
      .filter((c) =>
        c.displayName.toLowerCase().includes(query.toLowerCase()) ||
        (c.alias && c.alias.toLowerCase().includes(query.toLowerCase()))
      )
      .map((c) => ({
        id: c.id,
        displayName: c.displayName,
        email: "",
        image: c.image,
        isContact: true,
      })),
    ...globalPlayers
      .filter((p) => !contactIds.has(p.id))
      .map((p) => ({
        id: p.id,
        displayName: p.alias || p.displayName,
        email: p.email,
        image: p.image,
        isContact: false,
      })),
  ].slice(0, 15);

  return NextResponse.json({
    players: merged,
  });
}
