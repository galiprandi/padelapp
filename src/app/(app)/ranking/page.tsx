import { Suspense } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { RankingSearch } from "@/components/ranking/ranking-search";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function RankingPage({ searchParams }: RankingPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Ranking</h1>
        <p className="text-sm text-muted-foreground">
          Posiciones según resultados confirmados.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-12 w-full rounded-xl" />}>
        <RankingSearch />
      </Suspense>

      <Suspense fallback={<RankingContentSkeleton />}>
        <RankingContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function RankingContent({ searchParams }: RankingPageProps) {
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

function RankingContentSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* User banner skeleton */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Podium skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <Skeleton className="h-4 w-6 shrink-0" />
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
