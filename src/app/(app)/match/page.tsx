import { Suspense } from "react";
import { auth } from "@/auth";
import { MatchResultCompact, type MatchResultCompactMatch, type MatchResultCompactPlayer } from "@/components/matches/match-result-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getPendingActions, getCachedConfirmedMatches } from "@/lib/queries";
import Link from "next/link";
import { CalendarOff, Plus, ChevronRight } from "lucide-react";
import {
  calculateMatchSummaryStats,
  groupMatchesByMonth,
  getMatchListHeadingTitle,
  getMatchListHeadingDescription,
  getMatchListSkeletonAriaLabel,
  getMatchListSectionAriaLabel,
  getMatchListEmptyStateProps,
  getMatchListAuthPromptText,
  getMatchSummaryHeadingTitle,
  getMatchSummaryMatchesLabel,
  getMatchSummaryWinRateLabel,
  getMatchSummaryStreakLabel,
  getMatchSummaryWinsLabel,
  getMatchSummaryBestPartnerLabel,
  formatMatchSummaryPartnerWins,
  getMatchSummaryNemesisLabel,
  formatMatchSummaryNemesisLosses,
  getMatchListPendingHeadingTitle,
  getMatchListHistoryHeadingTitle,
  getMatchListCreateButtonText,
  getMatchListCreateButtonAriaLabel,
  getMatchListSeeAllNotificationsText,
  getMatchListSeeAllNotificationsAriaLabel,
  getMatchListPendingScoreLabel,
  getMatchListPendingConfirmLabel,
  getMatchListLoginButtonText,
  getMatchListMainContainerClasses,
  getMatchListHeaderContainerClasses,
  getMatchListHeadingTitleClasses,
  getMatchListHeadingDescriptionClasses,
  getMatchListSummaryCardClasses,
  getMatchListSummaryGridClasses,
  getMatchListSummaryMetricLabelClasses,
  getMatchListSummaryMetricValueClasses,
  getMatchListSummaryRelationsContainerClasses,
  getMatchListSummaryRelationLinkClasses,
  getMatchListPendingHeaderClasses,
  getMatchListPendingHeaderGroupClasses,
  getMatchListPendingBadgeClasses,
  getMatchListPendingNotificationsLinkClasses,
  getMatchListPendingListContainerClasses,
  getMatchListHistoryContainerClasses,
  getMatchListHistoryGroupListClasses,
  getMatchListHistoryMonthGroupClasses,
  getMatchListHistoryMonthTitleClasses,
  getMatchListAuthPromptContainerClasses,
  getMatchListAuthPromptDescriptionClasses,
} from "@/lib/match-helpers";

export default function MatchListPage() {
  return (
    <div className={getMatchListMainContainerClasses()}>
      <div className={getMatchListHeaderContainerClasses()}>
        <div>
          <h1 className={getMatchListHeadingTitleClasses()}>{getMatchListHeadingTitle()}</h1>
          <p className={getMatchListHeadingDescriptionClasses()}>
            {getMatchListHeadingDescription()}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/match/new" prefetch={true} aria-label={getMatchListCreateButtonAriaLabel()}>
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            {getMatchListCreateButtonText()}
          </Link>
        </Button>
      </div>

      <Suspense fallback={<MatchListSkeleton />}>
        <MatchList />
      </Suspense>
    </div>
  );
}

interface RawMatch {
  id: string;
  date: Date | string;
  score: string | null;
  status: string;
  players: Array<{
    id: string;
    position: number;
    displayName: string | null;
    resultConfirmed: boolean;
    side: "RIGHT" | "LEFT" | null;
    user: {
      id: string;
      displayName: string | null;
      alias: string | null;
      image: string | null;
    } | null;
  }>;
}

async function MatchList() {
  const session = await auth();
  const viewerId = session?.user?.id;

  const [confirmedMatchesRaw, pendingActions] = await Promise.all([
    viewerId ? getCachedConfirmedMatches(viewerId) : Promise.resolve([]),
    viewerId ? getPendingActions(viewerId) : Promise.resolve([]),
  ]);

  // Map to the same shape that getEnhancedUserMatches returns
  const confirmedMatches: MatchResultCompactMatch[] = (confirmedMatchesRaw as RawMatch[]).map((match: RawMatch) => ({
    id: match.id,
    createdAt: match.date,
    score: match.score,
    status: match.status,
    date: match.date,
    players: match.players.map((player) => {
      return {
        id: player.id,
        position: player.position,
        displayName: player.displayName,
        resultConfirmed: player.resultConfirmed,
        side: player.side,
        user: player.user
          ? {
            id: player.user.id,
            displayName: player.user.displayName ?? null,
            alias: player.user.alias ?? null,
            image: player.user.image ?? undefined,
          }
          : null,
      };
    }),
  }));

  const summaryStats = calculateMatchSummaryStats(confirmedMatches, viewerId);
  const groupedMatches = groupMatchesByMonth(confirmedMatches);

  return (
    <div className={getMatchListMainContainerClasses()}>
      {viewerId && summaryStats.totalMatches > 0 && (
        <section
          role="region"
          aria-label={getMatchListSectionAriaLabel("summary")}
          className={getMatchListSummaryCardClasses()}
        >
          <h2 className="text-sm font-bold text-foreground mb-3">{getMatchSummaryHeadingTitle()}</h2>
          <div className={getMatchListSummaryGridClasses()}>
            <div>
              <p className={getMatchListSummaryMetricLabelClasses()}>{getMatchSummaryMatchesLabel()}</p>
              <p className={getMatchListSummaryMetricValueClasses(false)}>
                {summaryStats.totalMatches}
              </p>
            </div>
            <div>
              <p className={getMatchListSummaryMetricLabelClasses()}>{getMatchSummaryWinRateLabel()}</p>
              <p className={getMatchListSummaryMetricValueClasses(true)}>{summaryStats.winRate}%</p>
            </div>
            {summaryStats.currentStreak >= 2 ? (
              <div>
                <p className={getMatchListSummaryMetricLabelClasses()}>{getMatchSummaryStreakLabel()}</p>
                <p className={getMatchListSummaryMetricValueClasses(true)}>
                  {summaryStats.currentStreak}W
                </p>
              </div>
            ) : (
              <div>
                <p className={getMatchListSummaryMetricLabelClasses()}>{getMatchSummaryWinsLabel()}</p>
                <p className={getMatchListSummaryMetricValueClasses(false)}>
                  {summaryStats.wins}
                </p>
              </div>
            )}
          </div>
          {(summaryStats.bestPartner || summaryStats.nemesis) && (
            <div className={getMatchListSummaryRelationsContainerClasses()}>
              {summaryStats.bestPartner && (
                <p className={getMatchListSummaryMetricLabelClasses()}>
                  {getMatchSummaryBestPartnerLabel()}{" "}
                  <Link
                    href={`/p/${summaryStats.bestPartner.id}`}
                    prefetch={true}
                    className={getMatchListSummaryRelationLinkClasses()}
                  >
                    {summaryStats.bestPartner.name}
                  </Link>{" "}
                  {formatMatchSummaryPartnerWins(summaryStats.bestPartner.count)}
                </p>
              )}
              {summaryStats.nemesis && (
                <p className={getMatchListSummaryMetricLabelClasses()}>
                  {getMatchSummaryNemesisLabel()}{" "}
                  <Link
                    href={`/p/${summaryStats.nemesis.id}`}
                    prefetch={true}
                    className={getMatchListSummaryRelationLinkClasses()}
                  >
                    {summaryStats.nemesis.name}
                  </Link>{" "}
                  {formatMatchSummaryNemesisLosses(summaryStats.nemesis.count)}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {pendingActions.length > 0 && (
        <section
          role="region"
          aria-label={getMatchListSectionAriaLabel("pending")}
          className={getMatchListHistoryContainerClasses()}
        >
          <div className={getMatchListPendingHeaderClasses()}>
            <div className={getMatchListPendingHeaderGroupClasses()}>
              <h2 className="text-sm font-bold text-foreground">{getMatchListPendingHeadingTitle()}</h2>
              <span className={getMatchListPendingBadgeClasses()}>
                {pendingActions.length}
              </span>
            </div>
            {pendingActions.length > 3 && (
              <Link
                href="/notifications"
                prefetch={true}
                aria-label={getMatchListSeeAllNotificationsAriaLabel(pendingActions.length)}
                className={getMatchListPendingNotificationsLinkClasses()}
              >
                {getMatchListSeeAllNotificationsText()} <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            )}
          </div>
          <div className={getMatchListPendingListContainerClasses()}>
            {pendingActions.slice(0, 3).map((match) => {
              const needsScore = !match.score;
              return (
                <MatchResultCompact
                  key={match.id}
                  match={match}
                  detailUrl={
                    needsScore
                      ? `/match/${match.id}/result`
                      : `/match/${match.id}`
                  }
                  label={needsScore ? getMatchListPendingScoreLabel() : getMatchListPendingConfirmLabel()}
                  viewerId={viewerId}
                />
              );
            })}
          </div>
        </section>
      )}

      <section
        role="region"
        aria-label={getMatchListSectionAriaLabel("history")}
        className={getMatchListHistoryContainerClasses()}
      >
        <h2 className="text-sm font-bold text-foreground">{getMatchListHistoryHeadingTitle()}</h2>
        {viewerId ? (
          confirmedMatches.length > 0 ? (
            <div className={getMatchListHistoryGroupListClasses()}>
              {Object.entries(groupedMatches).map(
                ([monthYear, monthMatches]) => (
                  <div key={monthYear} className={getMatchListHistoryMonthGroupClasses()}>
                    <h3 className={getMatchListHistoryMonthTitleClasses()}>
                      {monthYear}
                    </h3>
                    <div className={getMatchListPendingListContainerClasses()}>
                      {(monthMatches as MatchResultCompactMatch[]).map((match: MatchResultCompactMatch) => (
                        <MatchResultCompact
                          key={match.id}
                          match={match}
                          detailUrl={`/match/${match.id}`}
                          viewerId={viewerId}
                        />
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (() => {
            const emptyProps = getMatchListEmptyStateProps();
            return (
              <EmptyState
                title={emptyProps.title}
                description={emptyProps.description}
                icon={CalendarOff}
                action={
                  <Button asChild className="w-full">
                    <Link href="/match/new" prefetch={true}>{emptyProps.actionText}</Link>
                  </Button>
                }
              />
            );
          })()
        ) : (
          <div className={getMatchListAuthPromptContainerClasses()}>
            <p className={getMatchListAuthPromptDescriptionClasses()}>
              {getMatchListAuthPromptText()}
            </p>
            <Button asChild className="w-full">
              <Link href="/login" prefetch={true}>{getMatchListLoginButtonText()}</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function MatchListSkeleton() {
  return (
    <div
      role="region"
      aria-label={getMatchListSkeletonAriaLabel()}
      aria-busy="true"
      className={getMatchListMainContainerClasses()}
    >
      {/* Resumen skeleton */}
      <div className={getMatchListSummaryCardClasses()}>
        <Skeleton className="h-4 w-20 mb-3" />
        <div className={getMatchListSummaryGridClasses()}>
          <div>
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-6 w-8" />
          </div>
          <div>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-6 w-12" />
          </div>
          <div>
            <Skeleton className="h-3 w-10 mb-1" />
            <Skeleton className="h-6 w-8" />
          </div>
        </div>
      </div>

      {/* Historial/Pendientes list skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
