import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";

  const players = await prisma.user.findMany({
    where:
      query.length > 0
        ? {
            OR: [
              { displayName: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
    take: 10,
    orderBy: { displayName: "asc" },
  });

  return NextResponse.json({
    players: players.map((player) => ({
      id: player.id,
      displayName: player.displayName,
      email: player.email,
      image: player.image,
    })),
  });
}
