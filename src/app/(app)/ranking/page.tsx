import { Suspense } from "react";
import { EmptyState } from "@/components/empty-state";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { RankingSearch } from "@/components/ranking/ranking-search";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { auth } from "@/auth";
import { PlayerAvatar } from "@/components/players/player-avatar";
import Link from "next/link";
import { RankingListItem } from "@/components/ranking/ranking-list-item";

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
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-foreground">Podio</h2>
                <div className="grid grid-cols-3 gap-2">
                  {topThree[1] && (
                    <Link
                      href={`/p/${topThree[1].id}`}
                      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3"
                    >
                      <PlayerAvatar
                        name={
                          topThree[1].alias ??
                          topThree[1].displayName ??
                          "Player"
                        }
                        image={topThree[1].image ?? undefined}
                        size={48}
                        className="border-2 border-muted"
                      />
                      <span className="text-xs font-semibold text-foreground truncate max-w-full">
                        {topThree[1].alias ?? topThree[1].displayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(topThree[1].rankingScore)} pts
                      </span>
                    </Link>
                  )}
                  {topThree[0] && (
                    <Link
                      href={`/p/${topThree[0].id}`}
                      className="flex flex-col items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3"
                    >
                      <PlayerAvatar
                        name={
                          topThree[0].alias ??
                          topThree[0].displayName ??
                          "Player"
                        }
                        image={topThree[0].image ?? undefined}
                        size={56}
                        className="border-2 border-primary"
                      />
                      <span className="text-xs font-bold text-foreground truncate max-w-full">
                        {topThree[0].alias ?? topThree[0].displayName}
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        {Math.round(topThree[0].rankingScore)} pts
                      </span>
                    </Link>
                  )}
                  {topThree[2] && (
                    <Link
                      href={`/p/${topThree[2].id}`}
                      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3"
                    >
                      <PlayerAvatar
                        name={
                          topThree[2].alias ??
                          topThree[2].displayName ??
                          "Player"
                        }
                        image={topThree[2].image ?? undefined}
                        size={44}
                        className="border-2 border-muted"
                      />
                      <span className="text-xs font-semibold text-foreground truncate max-w-full">
                        {topThree[2].alias ?? topThree[2].displayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(topThree[2].rankingScore)} pts
                      </span>
                    </Link>
                  )}
                </div>
              </div>
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
