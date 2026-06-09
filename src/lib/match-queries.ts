import { prisma } from "@/lib/prisma";
import type { MatchResultCompactMatch } from "@/components/matches/match-result-card";

export async function getEnhancedUserMatches(userId: string, statusFilter?: "PENDING" | "CONFIRMED" | "DISPUTED") {
  const matches = await prisma.match.findMany({
    where: {
      status: statusFilter,
      players: {
        some: { userId },
      },
    },
    include: {
      players: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 20,
  });

  return matches.map<MatchResultCompactMatch>((match) => ({
    id: match.id,
    createdAt: match.date,
    score: match.score,
    status: match.status,
    date: match.date,
    players: match.players.map((player) => {
      const preferredName = player.user && "alias" in player.user && player.user.alias
        ? player.user.alias
        : player.user?.displayName;
      return {
        id: player.id,
        position: player.position,
        displayName: player.displayName,
        user: player.user
          ? {
            id: player.user.id,
            displayName: preferredName ?? null,
            image: player.user.image ?? undefined,
          }
          : null,
      };
    }),
  }));
}

export function getPendingActions(matches: MatchResultCompactMatch[], now: Date = new Date()) {
  return matches
    .filter(m => new Date(m.date || m.createdAt) < now)
    .sort((a, b) => {
      // Prioritize those that HAVE a score (need confirmation) over those that DON'T (need score entry)
      if (a.score && !b.score) return -1;
      if (!a.score && b.score) return 1;
      // Secondary: most recent date first
      return new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime();
    });
}
