import { Suspense } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { RankingSearch } from "@/components/ranking/ranking-search";
import { Button } from "@/components/ui/button";
import {
  getCachedRanking,
  getCachedRankingSearch,
  getCurrentUserRankingData,
} from "@/lib/queries";
import { Users } from "lucide-react";
import { auth } from "@/auth";
import { RankingListItem } from "@/components/ranking/ranking-list-item";
import { RankingPodium } from "@/components/ranking/ranking-podium";
import { RankingInfo } from "@/components/ranking/ranking-info";

interface RankingPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function RankingPage({ searchParams }: RankingPageProps) {
  const session = await auth();
  const viewerId = session?.user?.id;
  const { q: query } = await searchParams;

  const players = query
    ? await getCachedRankingSearch(query)
    : await getCachedRanking();

  const currentUser = viewerId
    ? await getCurrentUserRankingData(viewerId)
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

      {!query && <RankingInfo />}

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
              <RankingPodium topThree={topThree} viewerId={viewerId} />
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
            action={
              query ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/ranking">Limpiar búsqueda</Link>
                </Button>
              ) : null
            }
          />
        )}
      </div>
    </div>
  );
}
