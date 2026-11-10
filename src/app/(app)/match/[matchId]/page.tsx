import { auth } from "@/auth";
import { getMatchByIdAction } from "@/app/(app)/match/actions";
import { Button } from "@/components/ui/button";
import { MatchResultCompact } from "@/components/matches/match-result-card";
import { MatchPlayersManager } from "@/components/matches/match-players-manager";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { ShareButton } from "@/components/share/share-button";
import { FileText, CheckCircle2, Edit3 } from "lucide-react";
import { AttendanceBadge } from "@/components/matches/attendance-badge";
import Link from "next/link";
import { createMagicLink } from "@/lib/magic-link";
import { cn } from "@/lib/utils";
import { LocalDate } from "@/components/ui/local-date";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ConfirmResultForm,
  FinalizeMatchForm,
  CancelMatchForm,
} from "@/components/matches/match-actions";
import { getMatchTypeLabel } from "./edit/edit-match-utils";
import {
  getMatchDetailSkeletonAriaLabel,
  getMatchStatusBadgeText,
  getMatchDetailRegionAriaLabel,
  getMatchNotFoundTitle,
  getMatchNotFoundButtonText,
  getMatchCancelledTitle,
  getMatchCancelledButtonText,
  getMatchScoreSets,
  getMatchShareButtonAriaLabel,
  getPlayerProfileLinkAriaLabel,
  formatMatchClubCourtText,
  getMatchHeaderTitle,
  getMatchClubLabel,
  getMatchOrganizerLabel,
  getMatchEnterScoreButtonText,
  getMatchEditButtonText,
  getMatchInviteShareTitle,
  getMatchResultShareTitle,
  getMatchFinalScoreHeadingTitle,
  getMatchModeLabel,
  getMatchConfirmationsHeadingTitle,
  getMatchConfirmationsDescription,
  getPlayerConfirmationStatusText,
  getMatchCreatorFinalizeNoticeText,
  getPendingConfirmationBannerTitle,
  getPendingConfirmationBannerDescription,
  getMatchProcessedNoticeText,
  getMatchAttendanceHeadingTitle,
  getMatchTeamsHeadingTitle,
  getMatchOrganizerNotesHeadingTitle,
  getMatchDetailSkeletonContainerClasses,
  getMatchDetailNotFoundContainerClasses,
  getMatchDetailCancelledContainerClasses,
  getMatchDetailMainContainerClasses,
  getMatchStatusBadgeClasses,
  getMatchDetailInfoSectionClasses,
  getMatchDetailClubCardClasses,
  getMatchDetailOrganizerCardClasses,
  getMatchDetailActionsSectionClasses,
  getMatchDetailPrimaryActionButtonClasses,
  getMatchDetailSecondaryActionButtonClasses,
  getMatchDetailScoreSummaryCardClasses,
  getMatchDetailScoreSetsGridClasses,
  getMatchDetailScoreSetItemClasses,
  getMatchDetailPlayerAvatarOverlayClasses,
  getMatchDetailPlayerAvatarLinkClasses,
  getMatchDetailConfirmationsCardClasses,
  getMatchDetailPlayerConfirmationItemClasses,
  getMatchDetailPlayerConfirmationNameClasses,
  getMatchDetailPlayerConfirmationStatusClasses,
  getMatchDetailStickyBannerContainerClasses,
  getMatchDetailStickyBannerCardClasses,
  getMatchDetailStickyBannerIconBadgeClasses,
  getMatchDetailProcessedNoticeClasses,
  getMatchDetailAttendanceCardClasses,
  getMatchDetailNotesCardClasses,
} from "./match-detail-utils";

interface MatchPageProps {
  params: Promise<{
    matchId: string;
  }>;
}

export default function MatchPage({ params }: MatchPageProps) {
  return (
    <Suspense fallback={<MatchSkeleton />}>
      <MatchContent params={params} />
    </Suspense>
  );
}

function MatchSkeleton() {
  return (
    <div
      role="region"
      aria-label={getMatchDetailSkeletonAriaLabel()}
      aria-busy="true"
      className={getMatchDetailSkeletonContainerClasses()}
    >
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}

async function MatchContent({ params }: MatchPageProps) {
  const { matchId } = await params;
  const session = await auth();
  const viewerId = session?.user?.id;

  // Obtener datos del match
  const result = await getMatchByIdAction(matchId);

  if (!result.match) {
    return (
      <div
        role="region"
        aria-label={getMatchDetailRegionAriaLabel("not_found")}
        className={getMatchDetailNotFoundContainerClasses()}
      >
        <h1 className="text-xl font-bold text-foreground">
          {getMatchNotFoundTitle()}
        </h1>
        <Button asChild className="active:scale-[0.98] transition-all">
          <Link href="/match/new" prefetch={true}>
            {getMatchNotFoundButtonText()}
          </Link>
        </Button>
      </div>
    );
  }
  const match = result.match;

  const isClosed = Boolean(match.score) || match.status === "CONFIRMED";
  const isCancelled = match.status === "CANCELLED";

  if (isCancelled) {
    return (
      <div
        role="region"
        aria-label={getMatchDetailRegionAriaLabel("cancelled")}
        className={getMatchDetailCancelledContainerClasses()}
      >
        <h1 className="text-xl font-bold text-foreground">
          {getMatchCancelledTitle()}
        </h1>
        <Button asChild variant="ghost" className="active:scale-[0.98] transition-all">
          <Link href="/match" prefetch={true}>
            {getMatchCancelledButtonText()}
          </Link>
        </Button>
      </div>
    );
  }

  // Agrupar jugadores por equipo
  const teamsMap = new Map();
  match.players.forEach((player) => {
    if (player.teamId) {
      if (!teamsMap.has(player.teamId)) {
        teamsMap.set(player.teamId, {
          id: player.teamId,
          label: player.team?.label || `Equipo ${player.teamId.slice(-4)}`,
          players: [],
        });
      }
      const displayName =
        player.displayName ||
        player.user?.displayName ||
        `Jugador ${player.position + 1}`;
      teamsMap.get(player.teamId).players.push({
        id: player.id,
        userId: player.userId,
        name: displayName,
        image: player.user?.image,
        isConfirmed: player.resultConfirmed,
        category: player.user ? 5 : undefined,
        placeholderName: player.displayName || displayName,
      });
    }
  });

  const teams = Array.from(teamsMap.values());

  // Transform match data for MatchResultCompact component
  const matchResultData = {
    id: match.id,
    createdAt: match.createdAt,
    score: match.score,
    status: match.status,
    players: match.players.map((player) => ({
      id: player.id,
      position: player.position,
      side: player.side,
      user: player.user
        ? {
            id: player.user.id,
            displayName: player.user.displayName,
            image: player.user.image,
          }
        : null,
    })),
  };

  const isPendingConfirmation = match.score && match.status !== "CONFIRMED";
  const userNeedsToConfirm =
    viewerId &&
    match.players.some((p) => p.userId === viewerId && !p.resultConfirmed);

  const parsedScoreSets = getMatchScoreSets(match.score);

  return (
    <div className={getMatchDetailMainContainerClasses(Boolean(userNeedsToConfirm))}>
      <header role="region" aria-label={getMatchDetailRegionAriaLabel("header")}>
        <h1 className="text-xl font-bold text-foreground">
          {getMatchHeaderTitle(getMatchTypeLabel(match.matchType))}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className={getMatchStatusBadgeClasses(match.status)}>
            {getMatchStatusBadgeText(match.status)}
          </span>
          <span className="text-xs text-muted-foreground">
            <LocalDate
              date={match.date}
              options={{ day: "2-digit", month: "2-digit", year: "2-digit" }}
              locale="es-AR"
            />
          </span>
        </div>
      </header>

      <section
        role="region"
        aria-label={getMatchDetailRegionAriaLabel("details")}
        className={getMatchDetailInfoSectionClasses()}
      >
        {match.club && (
          <div className={getMatchDetailClubCardClasses()}>
            <span className="text-xs text-muted-foreground">{getMatchClubLabel()}</span>
            <span className="text-sm font-semibold text-foreground truncate">
              {formatMatchClubCourtText(match.club, match.courtNumber)}
            </span>
          </div>
        )}
        {match.creatorId ? (
          <Link
            href={`/p/${match.creatorId}`}
            prefetch={true}
            className={getMatchDetailOrganizerCardClasses(true)}
            aria-label={getPlayerProfileLinkAriaLabel(match.creator?.displayName)}
          >
            <PlayerAvatar
              name={match.creator?.displayName || "U"}
              image={match.creator?.image ?? undefined}
              className="h-8 w-8 rounded-lg"
            />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{getMatchOrganizerLabel()}</span>
              <span className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                {match.creator?.displayName || "Usuario"}
              </span>
            </div>
          </Link>
        ) : (
          <div className={getMatchDetailOrganizerCardClasses(false)}>
            <PlayerAvatar
              name={match.creator?.displayName || "U"}
              image={match.creator?.image ?? undefined}
              className="h-8 w-8 rounded-lg"
            />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{getMatchOrganizerLabel()}</span>
              <span className="text-sm font-semibold text-foreground">
                {match.creator?.displayName || "Usuario"}
              </span>
            </div>
          </div>
        )}
      </section>

      <section
        role="region"
        aria-label={getMatchDetailRegionAriaLabel("actions")}
        className={getMatchDetailActionsSectionClasses()}
      >
        {!isClosed ? (
          <>
            <Button asChild className={getMatchDetailPrimaryActionButtonClasses()}>
              <Link href={`/match/${match.id}/result`} prefetch={true}>
                <FileText className="mr-2 h-4 w-4" />
                {getMatchEnterScoreButtonText()}
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button asChild variant="outline" className={getMatchDetailSecondaryActionButtonClasses()}>
                <Link href={`/match/${match.id}/edit`} prefetch={true}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  {getMatchEditButtonText()}
                </Link>
              </Button>
              <ShareButton
                title={getMatchInviteShareTitle()}
                shareData={{
                  type: "match-invite",
                  club: match.club || "el club",
                  date: match.date,
                }}
                url={
                  createMagicLink({ resource: "match", identifier: match.id })
                    .url
                }
                variant="outline"
                aria-label={getMatchShareButtonAriaLabel(false)}
                className={getMatchDetailSecondaryActionButtonClasses()}
              />
            </div>
            {viewerId === match.creatorId && (
              <CancelMatchForm matchId={match.id} />
            )}
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <Button asChild variant="outline" className={getMatchDetailSecondaryActionButtonClasses()}>
                <Link href={`/match/${match.id}/edit`} prefetch={true}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  {getMatchEditButtonText()}
                </Link>
              </Button>
              <ShareButton
                title={getMatchResultShareTitle()}
                shareData={{
                  type: "match-result",
                  club: match.club || "el club",
                  date: match.date,
                  score: match.score,
                }}
                url={
                  createMagicLink({ resource: "match", identifier: match.id })
                    .url
                }
                variant="outline"
                aria-label={getMatchShareButtonAriaLabel(true)}
                className={getMatchDetailSecondaryActionButtonClasses()}
              />
            </div>
            {viewerId === match.creatorId && match.status !== "CONFIRMED" && (
              <CancelMatchForm matchId={match.id} />
            )}
          </>
        )}
      </section>

      {isClosed ? (
        <div className="space-y-6">
          <section
            role="region"
            aria-label={getMatchDetailRegionAriaLabel("summary")}
            className={getMatchDetailScoreSummaryCardClasses()}
          >
            <span className="text-xs font-semibold text-muted-foreground mb-6">
              {getMatchFinalScoreHeadingTitle()}
            </span>
            <div className={getMatchDetailScoreSetsGridClasses()}>
              {parsedScoreSets.map((set, idx) => (
                <div
                  key={idx}
                  className={getMatchDetailScoreSetItemClasses()}
                >
                  {set}
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="flex -space-x-2 items-center">
                {match.players
                  .sort((a, b) => a.position - b.position)
                  .map((p) => {
                    const displayName = p.displayName || p.user?.displayName || "";
                    const avatarElement = (
                      <PlayerAvatar
                        name={displayName}
                        image={p.user?.image ?? undefined}
                        className={getMatchDetailPlayerAvatarOverlayClasses()}
                        size={40}
                      />
                    );

                    return p.userId ? (
                      <Link
                        key={p.id}
                        href={`/p/${p.userId}`}
                        prefetch={true}
                        className={getMatchDetailPlayerAvatarLinkClasses()}
                        aria-label={getPlayerProfileLinkAriaLabel(displayName)}
                      >
                        {avatarElement}
                      </Link>
                    ) : (
                      <div key={p.id}>
                        {avatarElement}
                      </div>
                    );
                  })}
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                {getMatchModeLabel(getMatchTypeLabel(match.matchType))}
              </p>
            </div>
          </section>

          <MatchResultCompact
            match={matchResultData}
            matchDate={match.createdAt}
            detailUrl={`/match/${match.id}`}
            viewerId={viewerId}
            showDetailLink={false}
          />

          {isPendingConfirmation && (
            <section
              role="region"
              aria-label={getMatchDetailRegionAriaLabel("confirmations")}
              className={getMatchDetailConfirmationsCardClasses()}
            >
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-foreground">
                  {getMatchConfirmationsHeadingTitle()}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {getMatchConfirmationsDescription()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {match.players
                  .sort((a, b) => a.position - b.position)
                  .map((player) => {
                    const displayName =
                      player.displayName ||
                      player.user?.displayName ||
                      `Jugador ${player.position + 1}`;
                    const isConfirmed = player.resultConfirmed;
                    const isViewer = player.userId === viewerId;

                    const content = (
                      <>
                        <div className="relative">
                          <PlayerAvatar
                            name={displayName}
                            image={player.user?.image ?? undefined}
                            className={cn("h-10 w-10 border-2 border-card group-hover:opacity-85 transition-opacity")}
                          />
                          {isConfirmed && (
                            <div className="absolute -right-1 -bottom-1 rounded-full bg-primary p-0.5 border-2 border-card shadow-sm">
                              <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-center text-center gap-0.5 min-w-0 w-full">
                          <span className={getMatchDetailPlayerConfirmationNameClasses(isConfirmed)}>
                            {isViewer ? "Vos" : displayName}
                          </span>
                          <span className={getMatchDetailPlayerConfirmationStatusClasses(isConfirmed)}>
                            {getPlayerConfirmationStatusText(isConfirmed)}
                          </span>
                        </div>
                      </>
                    );

                    return (
                      <div
                        key={player.id}
                        className={getMatchDetailPlayerConfirmationItemClasses(isConfirmed)}
                      >
                        {player.userId ? (
                          <Link
                            href={`/p/${player.userId}`}
                            prefetch={true}
                            className="flex flex-col items-center gap-2 w-full transition-all active:scale-[0.98] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-md"
                            aria-label={getPlayerProfileLinkAriaLabel(displayName)}
                          >
                            {content}
                          </Link>
                        ) : (
                          <div className="flex flex-col items-center gap-2 w-full">
                            {content}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {viewerId === match.creatorId && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {getMatchCreatorFinalizeNoticeText()}
                  </p>
                  <FinalizeMatchForm matchId={match.id} />
                </div>
              )}
            </section>
          )}

          {userNeedsToConfirm && (
            <div className={getMatchDetailStickyBannerContainerClasses()}>
              <div className={getMatchDetailStickyBannerCardClasses()}>
                <div className="mb-3 flex items-center gap-2">
                  <div className={getMatchDetailStickyBannerIconBadgeClasses()}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">
                      {getPendingConfirmationBannerTitle()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getPendingConfirmationBannerDescription()}
                    </span>
                  </div>
                </div>
                <ConfirmResultForm matchId={match.id} />
              </div>
            </div>
          )}

          {!isPendingConfirmation && match.status === "CONFIRMED" && (
            <div className="flex justify-center">
              <span className={getMatchDetailProcessedNoticeClasses()}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                {getMatchProcessedNoticeText()}
              </span>
            </div>
          )}

          {match.players.some((p) => p.attendance) && (
            <section
              role="region"
              aria-label={getMatchDetailRegionAriaLabel("attendance")}
              className={getMatchDetailAttendanceCardClasses()}
            >
              <h2 className="text-sm font-bold text-foreground">{getMatchAttendanceHeadingTitle()}</h2>
              <div className="space-y-2">
                {match.players
                  .filter((p) => p.userId)
                  .sort((a, b) => a.position - b.position)
                  .map((player) => {
                    const displayName =
                      player.displayName ||
                      player.user?.displayName ||
                      `Jugador ${player.position + 1}`;
                    return (
                      <div
                        key={player.id}
                        className="flex items-center justify-between gap-2"
                      >
                        {player.userId ? (
                          <Link
                            href={`/p/${player.userId}`}
                            prefetch={true}
                            className="text-sm font-semibold text-foreground truncate hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-xs"
                            aria-label={getPlayerProfileLinkAriaLabel(displayName)}
                          >
                            {displayName}
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-foreground truncate">
                            {displayName}
                          </span>
                        )}
                        <AttendanceBadge
                          status={
                            (player.attendance as
                              | "ATTENDED"
                              | "LATE"
                              | "NO_SHOW"
                              | null) ?? null
                          }
                        />
                      </div>
                    );
                  })}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <section
            role="region"
            aria-label={getMatchDetailRegionAriaLabel("teams")}
            className="space-y-3"
          >
            <h2 className="text-sm font-bold text-foreground">
              {getMatchTeamsHeadingTitle()}
            </h2>
            <MatchPlayersManager
              matchId={match.id}
              creatorId={match.creatorId}
              teams={teams.map((team) => ({
                id: team.id,
                label: team.label,
                players: team.players.map(
                  (player: {
                    id: string;
                    userId?: string | null;
                    name: string;
                    image?: string | null;
                    isConfirmed?: boolean;
                    placeholderName: string;
                  }) => ({
                    matchPlayerId: player.id,
                    userId: player.userId,
                    name: player.name,
                    image: player.image,
                    isConfirmed: player.isConfirmed,
                    placeholderName: player.placeholderName,
                  }),
                ),
              }))}
            />
          </section>

          {match.notes && (
            <section
              role="region"
              aria-label={getMatchDetailRegionAriaLabel("notes")}
              className={getMatchDetailNotesCardClasses()}
            >
              <h3 className="text-sm font-bold text-foreground mb-2">
                {getMatchOrganizerNotesHeadingTitle()}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                &ldquo;{match.notes}&rdquo;
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
