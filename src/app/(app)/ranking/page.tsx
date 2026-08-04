import { Suspense } from "react";
import { UserRankingBanner } from "@/components/ranking/user-ranking-stats";
import { RankingSearch } from "@/components/ranking/ranking-search";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCachedRanking,
  getCachedRankingSearch,
  getCachedCurrentUserRankingData,
  getPendingActions,
} from "@/lib/queries";
import { auth } from "@/auth";
import { RankingFilter } from "@/components/ranking/ranking-filter";
import { RankingInfo } from "@/components/ranking/ranking-info";
import { PendingConfirmationsAlert } from "@/components/ranking/pending-confirmations-alert";

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
    ? await getCachedCurrentUserRankingData(viewerId)
    : null;

  const pendingActions = viewerId ? await getPendingActions(viewerId) : [];

  return (
    <div className="flex flex-col gap-6">
      {!query && <RankingInfo />}

      {viewerId && pendingActions.length > 0 && !query && (
        <PendingConfirmationsAlert
          pendingActions={pendingActions}
          viewerId={viewerId}
        />
      )}

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
          lastMatchAt={currentUser.lastMatchAt}
        />
      )}

      <RankingFilter
        players={players}
        viewerId={viewerId}
        query={query}
      />
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
