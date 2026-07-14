import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { RankingSearch } from "@/components/ranking/ranking-search";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { auth } from "@/auth";
import { RankingListItem } from "@/components/ranking/ranking-list-item";
import { RankingPodium } from "@/components/ranking/ranking-podium";

interface RankingPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function RankingPage({ searchParams }: RankingPageProps) {
  const session = await auth();
  const viewerId = session?.user?.id;
  const { q: query } = await searchParams;

  const players = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { displayName: { contains: query, mode: "insensitive" } },
            { alias: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [
      { rankingScore: "desc" },
      { attendanceScore: "desc" },
      { wins: "desc" },
      { lastMatchAt: "desc" },
      { displayName: "asc" },
    ],
    take: query ? 20 : 50,
    include: {
      matchPlayers: {
        where: {
          match: {
            status: "CONFIRMED",
          },
        },
        orderBy: {
          match: {
            date: "desc",
          },
        },
        take: 5,
        include: {
          match: true,
        },
      },
    },
  });

  const currentUser = viewerId
    ? await prisma.user.findUnique({
        where: { id: viewerId },
        include: {
          matchPlayers: {
            where: { match: { status: "CONFIRMED" } },
            orderBy: { match: { date: "desc" } },
            take: 5,
            include: { match: true },
          },
        },
      })
    : null;

  const topThree = !query ? players.slice(0, 3) : [];
  const listPlayers = !query ? players.slice(3) : players;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Ranking</h1>
        <p className="text-sm text-muted-foreground">
          Posiciones según resultados confirmados.
        </p>
      </div>

      <Suspense fallback={null}>
        <RankingSearch />
      </Suspense>

      {currentUser && currentUser.matchesPlayed > 0 && !query && (
        <UserRankingBanner
          position={currentUser.rankingPosition}
          score={currentUser.rankingScore}
          delta={currentUser.rankingDelta}
          wins={currentUser.wins}
          losses={currentUser.losses}
          level={currentUser.level}
          attendanceScore={currentUser.attendanceScore}
          matchesPlayed={currentUser.matchesPlayed}
        />
      )}

      <div className="space-y-3">
        {players.length > 0 ? (
          <>
            {!query && topThree.length > 0 && (
              <RankingPodium topThree={topThree} />
            )}

            <div className="space-y-2">
              {listPlayers.map((player, index) => (
                <RankingListItem
                  key={player.id}
                  player={player}
                  index={query ? index : index + 3}
                  viewerId={viewerId}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Users}
            title={query ? "No se encontraron jugadores" : "Sin jugadores"}
            description={
              query
                ? `No hay resultados para "${query}".`
                : "Aún no hay jugadores registrados."
            }
          />
        )}
      </div>
    </div>
  );
}
