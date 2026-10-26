import Link from "next/link";
import { auth } from "@/auth";
import {
  MatchResultCompact,
  type MatchResultCompactMatch,
} from "@/components/matches/match-result-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { TurnCard } from "@/components/turns/turn-card";
import { OpenToNetworkButton } from "@/components/turns/open-to-network-button";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { PushPermissionPrompt } from "@/components/pwa/push-permission-prompt";
import { PasskeyOnboarding } from "@/components/webauthn/passkey-onboarding";
import {
  CalendarDays,
  Trophy,
  ChevronRight,
  Activity,
  AlertTriangle,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import {
  getCachedEnhancedUserMatches,
  getPendingActions,
  getCachedPendingAttendanceActions,
  getCachedDashboardUserStats,
  getCachedMyUpcomingTurns,
  getCachedMySubstituteTurns,
  getCachedRecommendedTurns,
  getCachedPadelContacts,
} from "@/lib/queries";
import { getUserPasskeys } from "@/lib/webauthn/actions";
import { cn, capitalizeName } from "@/lib/utils";
import { Greeting } from "@/components/greeting";
import { LocalDate } from "@/components/ui/local-date";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { AppBadgeUpdater } from "@/components/pwa/app-badge-updater";
import { ShareButton } from "@/components/share/share-button";
import { OnboardingRedirect } from "@/components/onboarding-redirect";
import {
  calculateRecentForm,
  calculateDashboardBadgeCount,
  getAgendaItems,
  getHeroActivity,
  formatDashboardWelcomeSubtitle,
  getCreateFirstTurnAriaLabel,
  getIncompleteProfileRegionAriaLabel,
  getInviteFriendsRegionAriaLabel,
  getDashboardStatsRegionAriaLabel,
  getRankingStatAriaLabel,
  getMatchesStatAriaLabel,
  getWinsStatAriaLabel,
  getReputationStatAriaLabel,
  getHeroActivityRegionAriaLabel,
  formatMissingPlayersText,
  getPendingActionsRegionAriaLabel,
  getPendingActionMatchLabel,
  getPendingAttendanceRegionAriaLabel,
  formatPlayersWithoutAttendanceText,
  getAgendaRegionAriaLabel,
  getSubstituteTurnsRegionAriaLabel,
  getOpenSlotBadgeText,
  getRecommendedTurnsRegionAriaLabel,
  getRecentResultsRegionAriaLabel,
  formatRecentFormAriaLabel,
  getDashboardCreateTurnCtaClasses,
  getDashboardIncompleteProfileContainerClasses,
  getDashboardIncompleteProfileButtonClasses,
  getDashboardInviteFriendsContainerClasses,
  getDashboardStatsCardClasses,
  getDashboardHeroActivityContainerClasses,
  getDashboardPendingAttendanceItemClasses,
  getDashboardSubstituteItemClasses,
  getDashboardOpenSlotBadgeClasses,
  getDashboardEmptyAgendaContainerClasses,
  getCreateFirstTurnTitleText,
  getCreateFirstTurnDescriptionText,
  getIncompleteProfileTitleText,
  getIncompleteProfileDescriptionText,
  getIncompleteProfileButtonText,
  getInviteFriendsTitleText,
  getInviteFriendsDescriptionText,
  getInviteFriendsShareTitleText,
  getInviteFriendsShareText,
  getInviteFriendsShareSuccessToastText,
  getInviteFriendsShareCopyToastText,
  getDashboardHeroIncompleteTurnTitleText,
  getDashboardHeroNextActivityTitleText,
  getDashboardHeroMatchLabelText,
  getDashboardOpenToNetworkButtonLabel,
  getDashboardPendingActionsTitleText,
  getDashboardPendingAttendanceTitleText,
  getDashboardAgendaTitleText,
  getDashboardSeeAllText,
  getDashboardSeeAllPendingAriaLabel,
  getDashboardSeeAllAgendaAriaLabel,
  getDashboardEmptyAgendaTitleText,
  getDashboardEmptyAgendaDescriptionText,
  getDashboardEmptyAgendaExploreButtonText,
  getDashboardEmptyAgendaCreateButtonText,
  getDashboardNoMoreActivitiesText,
  getDashboardSubstituteTitleText,
  getDashboardRecommendedTitleText,
  getDashboardRecentResultsTitleText,
  getDashboardEmptyRecentResultsTitleText,
  getDashboardEmptyRecentResultsDescriptionText,
  getDashboardEmptyRecentResultsButtonText,
  type DashboardTurn,
} from "./dashboard-utils";

export default async function DashboardContent() {
  const session = await auth();
  const viewerId = session?.user?.id;

  if (!viewerId) return null;

  const [
    userStats,
    allPendingMatches,
    recentMatches,
    pendingAttendance,
    myTurns,
    mySubstituteTurns,
    recommendedTurns,
    passkeys,
    contacts,
  ] = await Promise.all([
    getCachedDashboardUserStats(viewerId),
    getCachedEnhancedUserMatches(viewerId, "PENDING"),
    getCachedEnhancedUserMatches(viewerId, "CONFIRMED"),
    getCachedPendingAttendanceActions(viewerId),
    getCachedMyUpcomingTurns(viewerId, 3),
    getCachedMySubstituteTurns(viewerId, 3),
    getCachedRecommendedTurns(viewerId, 3),
    getUserPasskeys(),
    getCachedPadelContacts(viewerId),
  ]);

  const user = userStats;

  const pendingActionMatches = await getPendingActions(
    viewerId,
    allPendingMatches,
  );

  const now = new Date();

  const upcomingMatches = allPendingMatches
    .filter((m) => new Date(m.date || m.createdAt) >= now)
    .sort(
      (a, b) =>
        new Date(a.date || a.createdAt).getTime() -
        new Date(b.date || b.createdAt).getTime(),
    );

  const displayName = capitalizeName(
    user?.displayName ?? user?.alias ?? session?.user?.name ?? "Jugador",
  );

  const isNewUser = user ? user.matchesPlayed === 0 : false;

  const agendaItems = getAgendaItems(myTurns, upcomingMatches);
  const heroActivity = getHeroActivity(agendaItems, now);

  const remainingAgendaItems = heroActivity
    ? agendaItems.slice(1)
    : agendaItems;

  const recentForm = calculateRecentForm(recentMatches, viewerId, 5);

  const incompleteTurns = myTurns.filter(
    (t) => t.players.length < t.maxPlayers,
  ).length;

  const badgeCount = calculateDashboardBadgeCount(
    incompleteTurns,
    pendingActionMatches.length,
    pendingAttendance.length,
  );

  return (
    <div className="flex flex-col gap-6">
      <AppBadgeUpdater count={badgeCount} />
      <OnboardingRedirect hasAlias={Boolean(user?.alias)} />
      {/* Greeting */}
      <div className="flex items-center gap-4">
        <PlayerAvatar
          name={displayName}
          image={user?.image ?? undefined}
          size={44}
          aria-hidden="true"
        />
        <div className="space-y-0.5 min-w-0">
          <Greeting
            name={displayName}
            level={user?.level}
            hasAlias={Boolean(user?.alias)}
            matchesPlayed={user?.matchesPlayed ?? 0}
          />
          <p className="text-sm text-muted-foreground">
            {formatDashboardWelcomeSubtitle(isNewUser)}
          </p>
        </div>
      </div>

      {isNewUser ? (
        <>
          {/* Hero CTA for first-time users */}
          {agendaItems.length === 0 && (
            <Link
              href="/turnos/nuevo"
              prefetch={true}
              className={getDashboardCreateTurnCtaClasses()}
              aria-label={getCreateFirstTurnAriaLabel()}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <CalendarDays className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">
                    {getCreateFirstTurnTitleText()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getCreateFirstTurnDescriptionText()}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </Link>
          )}
          <OnboardingChecklist
            initialAlias={user?.alias ?? null}
            hasActivity={agendaItems.length > 0}
          />
        </>
      ) : (
        !user?.alias && (
          <div
            role="region"
            aria-label={getIncompleteProfileRegionAriaLabel()}
            className={getDashboardIncompleteProfileContainerClasses()}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-amber-800 dark:text-amber-200" aria-hidden="true" />
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-100">
                {getIncompleteProfileTitleText()}
              </h2>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-normal">
              {getIncompleteProfileDescriptionText()}
            </p>
            <Button
              className={getDashboardIncompleteProfileButtonClasses()}
              asChild
            >
              <Link href="/me/profile" prefetch={true}>{getIncompleteProfileButtonText()}</Link>
            </Button>
          </div>
        )
      )}

      {/* Passkey Onboarding */}
      <PasskeyOnboarding hasPasskeys={passkeys.length > 0} />

      {/* Invite friends — visible for early users (<5 matches) */}
      {user && user.matchesPlayed < 5 && (
        <div
          role="region"
          aria-label={getInviteFriendsRegionAriaLabel()}
          className={getDashboardInviteFriendsContainerClasses()}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary border border-border shadow-xs">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-sm font-bold text-foreground">
              {getInviteFriendsTitleText()}
            </p>
            <p className="text-xs text-muted-foreground">
              {getInviteFriendsDescriptionText()}
            </p>
          </div>
          <ShareButton
            url="https://padelred.app?from=whatsapp"
            title={getInviteFriendsShareTitleText()}
            text={getInviteFriendsShareText()}
            successMessage={getInviteFriendsShareSuccessToastText()}
            copyMessage={getInviteFriendsShareCopyToastText()}
            iconOnly
            variant="outline"
            className="shrink-0"
            aria-label={getInviteFriendsRegionAriaLabel()}
          />
        </div>
      )}

      {/* Stats row */}
      {user && (
        <div
          role="region"
          aria-label={getDashboardStatsRegionAriaLabel()}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <Link
            href="/ranking"
            prefetch={true}
            className={getDashboardStatsCardClasses()}
            aria-label={getRankingStatAriaLabel(user.rankingPosition)}
          >
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
              Ranking
            </span>
            <span className="text-xl font-bold text-foreground">
              #{user.rankingPosition ?? "-"}
            </span>
          </Link>
          <Link
            href="/match"
            prefetch={true}
            className={getDashboardStatsCardClasses()}
            aria-label={getMatchesStatAriaLabel(user.matchesPlayed)}
          >
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
              Partidos
            </span>
            <span className="text-xl font-bold text-foreground">
              {user.matchesPlayed}
            </span>
          </Link>
          <Link
            href="/ranking"
            prefetch={true}
            className={getDashboardStatsCardClasses()}
            aria-label={getWinsStatAriaLabel(user.wins)}
          >
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
              Victorias
            </span>
            <span className="text-xl font-bold text-primary">{user.wins}</span>
          </Link>
          <Link
            href="/ranking"
            prefetch={true}
            className={getDashboardStatsCardClasses()}
            aria-label={getReputationStatAriaLabel(user.attendanceScore)}
          >
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
              Reputación
            </span>
            <span className="text-xl font-bold text-foreground">
              {Math.round((user.attendanceScore ?? 1) * 100)}%
            </span>
          </Link>
        </div>
      )}

      {!isNewUser && (
        <>
          <PwaInstallBanner />
          <PushPermissionPrompt />
        </>
      )}

      {/* Hero Activity */}
      {heroActivity && (() => {
        const isTurn = heroActivity.type === "turn";
        const turnData = isTurn ? (heroActivity.data as DashboardTurn) : null;
        const isIncompleteTurn = Boolean(
          turnData && turnData.players.length < turnData.maxPlayers,
        );

        return (
          <section
            role="region"
            aria-label={getHeroActivityRegionAriaLabel(isIncompleteTurn)}
            className={getDashboardHeroActivityContainerClasses(isIncompleteTurn)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isIncompleteTurn ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
                ) : (
                  <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
                )}
                <h2 className="text-sm font-bold text-foreground">
                  {isIncompleteTurn
                    ? getDashboardHeroIncompleteTurnTitleText()
                    : getDashboardHeroNextActivityTitleText()}
                </h2>
              </div>
              {isIncompleteTurn && turnData && (
                <span className="text-xs font-bold text-amber-600">
                  {formatMissingPlayersText(turnData.maxPlayers - turnData.players.length)}
                </span>
              )}
            </div>

            {isTurn ? (
              <div className="flex flex-col gap-3">
                <TurnCard
                  turn={heroActivity.data as Parameters<typeof TurnCard>[0]["turn"]}
                  isJoined={true}
                  isCreator={(heroActivity.data as { creatorId?: string }).creatorId === viewerId}
                  contacts={contacts}
                />
                {isIncompleteTurn && (
                  <OpenToNetworkButton
                    turnId={heroActivity.id}
                    club={(heroActivity.data as { club: string }).club}
                    lastNetworkNotificationAt={(heroActivity.data as { lastNetworkNotificationAt?: Date | null }).lastNetworkNotificationAt}
                    variant="default"
                    label={getDashboardOpenToNetworkButtonLabel()}
                    className="h-10 bg-amber-500 hover:bg-amber-600"
                  />
                )}
              </div>
            ) : (
              <MatchResultCompact
                match={heroActivity.data as MatchResultCompactMatch}
                detailUrl={`/match/${heroActivity.id}`}
                label={getDashboardHeroMatchLabelText()}
                viewerId={viewerId}
              />
            )}
          </section>
        );
      })()}

      {/* Pending actions */}
      {pendingActionMatches.length > 0 && (
        <section role="region" aria-label={getPendingActionsRegionAriaLabel()} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                {getDashboardPendingActionsTitleText()}
              </h2>
              <span className="rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground shadow-xs">
                {pendingActionMatches.length}
              </span>
            </div>
            {pendingActionMatches.length > 3 && (
              <Link
                href="/notifications"
                prefetch={true}
                className="flex items-center text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-xs active:scale-[0.98] transition-all"
                aria-label={getDashboardSeeAllPendingAriaLabel()}
              >
                {getDashboardSeeAllText()} <ChevronRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {pendingActionMatches.slice(0, 3).map((match) => {
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
                  label={getPendingActionMatchLabel(needsScore)}
                  viewerId={viewerId}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Pending attendance marking (creator only) */}
      {pendingAttendance.length > 0 && (
        <section role="region" aria-label={getPendingAttendanceRegionAriaLabel()} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">
              {getDashboardPendingAttendanceTitleText()}
            </h2>
            <span className="rounded-md bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800 px-1.5 py-0.5 text-xs font-bold shadow-xs">
              {pendingAttendance.length}
            </span>
          </div>
          <div className="space-y-2">
            {pendingAttendance.slice(0, 3).map((match) => (
              <Link
                key={match.id}
                href={`/match/${match.id}/result`}
                prefetch={true}
                className={getDashboardPendingAttendanceItemClasses()}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {match.club || "Partido"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <LocalDate
                      date={match.date}
                      options={{ day: "2-digit", month: "2-digit" }}
                      locale="es-AR"
                    />{" "}
                    · {formatPlayersWithoutAttendanceText(match.playersWithoutAttendance)}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* My Agenda */}
      <section role="region" aria-label={getAgendaRegionAriaLabel()} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">{getDashboardAgendaTitleText()}</h2>
          <Link
            href="/turnos"
            prefetch={true}
            className="flex items-center text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-xs active:scale-[0.98] transition-all"
            aria-label={getDashboardSeeAllAgendaAriaLabel()}
          >
            {getDashboardSeeAllText()} <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
        <div className="space-y-3">
          {remainingAgendaItems.length > 0 ? (
            remainingAgendaItems.map((item) => {
              return item.type === "turn" ? (
                <div
                  key={item.id}
                  className="border-l-4 border-l-blue-500/40 rounded-r-xl overflow-hidden"
                >
                  <TurnCard
                    turn={item.data as Parameters<typeof TurnCard>[0]["turn"]}
                    isJoined={(item.data as DashboardTurn).players.some(
                      (p: { userId: string }) => p.userId === viewerId,
                    )}
                    isCreator={(item.data as { creatorId?: string }).creatorId === viewerId}
                    contacts={contacts}
                  />
                </div>
              ) : (
                <div
                  key={item.id}
                  className="border-l-4 border-l-primary/40 rounded-r-xl overflow-hidden"
                >
                  <MatchResultCompact
                    match={item.data as MatchResultCompactMatch}
                    detailUrl={`/match/${item.id}`}
                    label="Próximo partido"
                    viewerId={viewerId}
                  />
                </div>
              );
            })
          ) : !heroActivity ? (
            <EmptyState
              icon={CalendarDays}
              title={getDashboardEmptyAgendaTitleText()}
              description={getDashboardEmptyAgendaDescriptionText()}
              action={
                <div className="flex flex-col gap-2 w-full">
                  <Button className="w-full h-12" asChild>
                    <Link href="/turnos" prefetch={true}>{getDashboardEmptyAgendaExploreButtonText()}</Link>
                  </Button>
                  <Button variant="outline" className="w-full h-12" asChild>
                    <Link href="/turnos/nuevo" prefetch={true}>{getDashboardEmptyAgendaCreateButtonText()}</Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <div className={getDashboardEmptyAgendaContainerClasses()}>
              <p className="text-xs text-muted-foreground">
                {getDashboardNoMoreActivitiesText()}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* My substitute turns */}
      {mySubstituteTurns.length > 0 && (
        <section role="region" aria-label={getSubstituteTurnsRegionAriaLabel()} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">{getDashboardSubstituteTitleText()}</h2>
            <span className="rounded-md bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800 px-1.5 py-0.5 text-xs font-bold shadow-xs">
              {mySubstituteTurns.length}
            </span>
          </div>
          <div className="space-y-2">
            {mySubstituteTurns.map((turn) => {
              const hasOpenSlot = turn.players.length < turn.maxPlayers;
              return (
                <Link
                  key={turn.id}
                  href={`/t/${turn.id}`}
                  prefetch={true}
                  className={getDashboardSubstituteItemClasses()}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {turn.club}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      <LocalDate
                        date={turn.date}
                        options={{
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }}
                        locale="es-AR"
                      />
                      {" · "}
                      {turn.players.length}/{turn.maxPlayers} jugadores
                    </span>
                  </div>
                  {hasOpenSlot ? (
                    <span className={getDashboardOpenSlotBadgeClasses()}>
                      {getOpenSlotBadgeText()}
                    </span>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recommended turns */}
      {recommendedTurns.length > 0 && (
        <section role="region" aria-label={getRecommendedTurnsRegionAriaLabel()} className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">
            {getDashboardRecommendedTitleText()}
          </h2>
          <div className="space-y-2">
            {recommendedTurns.map((turn) => (
              <TurnCard
                key={turn.id}
                turn={turn}
                variant="recommended"
                isJoined={turn.players.some(
                  (p: { userId: string }) => p.userId === viewerId,
                )}
                isCreator={turn.creatorId === viewerId}
                contacts={contacts}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent results */}
      <section role="region" aria-label={getRecentResultsRegionAriaLabel()} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">
              {getDashboardRecentResultsTitleText()}
            </h2>
            {recentForm.length > 0 && (
              <div
                className="flex gap-1"
                aria-label={formatRecentFormAriaLabel(recentForm)}
              >
                {recentForm.map((result, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className={cn(
                      "h-2 w-2 rounded-full",
                      result === "W" ? "bg-emerald-500" : "bg-rose-500",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {recentMatches.length > 0 ? (
            recentMatches.map((match) => (
              <MatchResultCompact
                key={match.id}
                match={match}
                detailUrl={`/match/${match.id}`}
                viewerId={viewerId}
              />
            ))
          ) : (
            <EmptyState
              icon={Trophy}
              title={getDashboardEmptyRecentResultsTitleText()}
              description={getDashboardEmptyRecentResultsDescriptionText()}
              action={
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/match" prefetch={true}>{getDashboardEmptyRecentResultsButtonText()}</Link>
                </Button>
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}
