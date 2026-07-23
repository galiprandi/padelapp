import { NextResponse } from "next/server";
import { and, eq, ilike, ne, or } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getPadelContacts } from "@/lib/queries";
import { unstable_cache } from "next/cache";

// Cache contacts per user for 60s, tagged for invalidation on match changes
const getCachedContacts = unstable_cache(
  async (userId: string) => getPadelContacts(userId),
  ["padel-contacts"],
  { revalidate: 60, tags: ["matches"] },
);

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";

  // When searching (2+ chars), skip contacts fetch entirely.
  // The global search already finds users by name/alias/email.
  // Contacts are only useful for the empty-input state (recent contacts).
  if (query.length >= 2) {
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
      .limit(15);

    return NextResponse.json({
      players: globalPlayers.map((p) => ({
        id: p.id,
        displayName: p.alias || p.displayName,
        email: p.email,
        image: p.image,
        isContact: false,
      })),
    });
  }

  // Empty query: return top 10 recent contacts (cached)
  const contacts = await getCachedContacts(session.user.id);

  return NextResponse.json({
    players: contacts.slice(0, 10).map((player) => ({
      id: player.id,
      displayName: player.displayName,
      email: "",
      image: player.image,
      isContact: true,
    })),
  });
}
