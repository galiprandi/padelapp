import { prisma } from "@/lib/prisma";
import { type MatchResultCompactMatch } from "@/components/matches/match-result-card";
import { getMatchWinner } from "./utils";

export async function getEnhancedUserMatches(
  userId: string,
  statusFilter?: "PENDING" | "CONFIRMED" | "DISPUTED" | "CANCELLED",
  limit = 20
): Promise<MatchResultCompactMatch[]> {
  const matches = await prisma.match.findMany({
    where: {
      status: statusFilter ?? { not: "CANCELLED" },
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
    take: limit,
  });

  return matches.map((match) => ({
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
        resultConfirmed: player.resultConfirmed,
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

export async function getPendingActions(userId: string) {
  const allPendingMatches = await getEnhancedUserMatches(userId, "PENDING");
  const now = new Date();

  // Filter for matches that have already happened
  return allPendingMatches
    .filter(m => new Date(m.date || m.createdAt) < now)
    .sort((a, b) => {
      // Prioritize those that HAVE a score (need confirmation) over those that DON'T have a score (need score upload)
      if (a.score && !b.score) return -1;
      if (!a.score && b.score) return 1;
      // Secondary: most recent first
      return new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime();
    });
}

export async function getHeadToHeadStats(viewerId: string, profileId: string) {
  const sharedMatches = await prisma.match.findMany({
    where: {
      status: "CONFIRMED",
      AND: [
        { players: { some: { userId: viewerId } } },
        { players: { some: { userId: profileId } } },
      ],
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
  });

  const stats = {
    together: { wins: 0, total: 0 },
    against: { wins: 0, total: 0 },
    lastMatch: sharedMatches[0]
      ? {
          id: sharedMatches[0].id,
          date: sharedMatches[0].date,
          score: sharedMatches[0].score,
          winner: getMatchWinner(sharedMatches[0].score),
          viewerTeam: sharedMatches[0].players.find((p) => p.userId === viewerId)!.position < 2 ? "A" : "B",
        }
      : null,
  };

  sharedMatches.forEach((match) => {
    const viewerPos = match.players.find((p) => p.userId === viewerId)?.position ?? 0;
    const profilePos = match.players.find((p) => p.userId === profileId)?.position ?? 0;

    const viewerTeam = viewerPos < 2 ? "A" : "B";
    const profileTeam = profilePos < 2 ? "A" : "B";

    const winner = getMatchWinner(match.score ?? null);

    if (viewerTeam === profileTeam) {
      stats.together.total++;
      if (winner === viewerTeam) stats.together.wins++;
    } else {
      stats.against.total++;
      if (winner === viewerTeam) stats.against.wins++;
    }
  });

  return stats;
}
