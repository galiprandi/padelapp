import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JoinSlotButton } from "./join-slot-button";
import { getCachedMatchSlotDetails } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, UserCheck, Trophy, MapPin, Users, ChevronLeft } from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerAvatar } from "@/components/players/player-avatar";
import {
  MATCH_STATUS,
  type MatchStatus,
  formatStatus,
  teamKeyForPosition,
  defaultTeamLabel,
  formatJoinSlotInvitationMessage,
  getJoinSlotHelperMessage,
  groupMatchSlotsByTeam,
  getJoinSlotRegionAriaLabel,
  getSlotStatusBadgeProps,
  getJoinSlotSkeletonAriaLabel,
  getJoinSlotHeaderTitle,
  getJoinSlotHeaderSubtitle,
  getJoinSlotBackAriaLabel,
  getJoinSlotInvitationLabel,
  getJoinSlotMatchDetailTitle,
  getJoinSlotClubSubtext,
  getJoinSlotCourtText,
  getJoinSlotFormationTitle,
  getJoinSlotJoiningAsLabel,
  getJoinSlotAlreadyJoinedButtonText,
  getJoinSlotViewMatchDetailsText,
  formatSlotPositionText,
  getSignInFormLabelForMatch,
  getJoinSlotMainClasses,
  getJoinSlotHeaderClasses,
  getJoinSlotBackButtonClasses,
  getJoinSlotInvitationCardClasses,
  getJoinSlotMatchCardClasses,
  getJoinSlotSlotItemClasses,
  getJoinSlotSlotNameClasses,
  getJoinSlotHelperWarningClasses,
  getJoinSlotFooterContainerClasses,
  getJoinSlotFooterIconBadgeClasses,
  getJoinSlotAlreadyJoinedButtonClasses,
  getJoinSlotDetailLinkClasses,
  getJoinSlotModalidadLabel,
  getJoinSlotEstadoLabel,
  formatMatchSetsText,
  getJoinSlotOrganizerFallbackName,
  formatFallbackSlotName,
  getJoinSlotInvitationCardInnerClasses,
  getJoinSlotInvitationAvatarClasses,
  getJoinSlotInvitationTextContainerClasses,
  getJoinSlotInvitationTitleClasses,
  getJoinSlotInvitationMessageClasses,
  getJoinSlotMatchCardHeaderClasses,
  getJoinSlotMatchCardTitleClasses,
  getJoinSlotMatchCardContentClasses,
  getJoinSlotMatchCardMetricCellClasses,
  getJoinSlotMatchCardMetricHeaderClasses,
  getJoinSlotMatchCardMetricTitleClasses,
  getJoinSlotMatchCardMetricValueClasses,
  getJoinSlotMatchCardBadgeContainerClasses,
  getJoinSlotMatchCardStatusBadgeClasses,
  getJoinSlotMatchCardClubRowClasses,
  getJoinSlotMatchCardClubIconContainerClasses,
  getJoinSlotMatchCardClubIconClasses,
  getJoinSlotMatchCardClubInfoClasses,
  getJoinSlotMatchCardClubTitleClasses,
  getJoinSlotMatchCardClubSubtitleClasses,
  getJoinSlotFormationSectionClasses,
  getJoinSlotFormationHeaderClasses,
  getJoinSlotFormationTitleClasses,
  getJoinSlotFormationIconClasses,
  getJoinSlotFormationGridClasses,
  getJoinSlotFormationTeamGroupClasses,
  getJoinSlotFormationTeamHeaderClasses,
  getJoinSlotFormationTeamLabelClasses,
  getJoinSlotFormationTeamDividerClasses,
  getJoinSlotFormationTeamSlotsGridClasses,
  getJoinSlotFormationSlotAvatarClasses,
  getJoinSlotFormationSlotInfoClasses,
  getJoinSlotFormationSlotPositionClasses,
  getJoinSlotFormationSlotBadgeClasses,
  getJoinSlotFooterContentClasses,
  getJoinSlotFooterLayoutClasses,
  getJoinSlotFooterUserBadgeRowClasses,
  getJoinSlotFooterIconClasses,
  getJoinSlotFooterUserBadgeInfoClasses,
  getJoinSlotFooterUserBadgeTitleClasses,
  getJoinSlotFooterUserBadgeTeamClasses,
  getJoinSlotFooterWarningIconClasses,
  getJoinSlotFooterWarningTextClasses,
  getJoinSlotFooterActionStackClasses,
  getJoinSlotSignInFormClasses,
  getJoinSlotSkeletonCardClasses,
  getJoinSlotSkeletonCardHeaderClasses,
  getJoinSlotSkeletonCardContentClasses,
  getJoinSlotSkeletonCardCellClasses,
  getJoinSlotSkeletonFormationClasses,
  getJoinSlotSkeletonFormationHeaderClasses,
  getJoinSlotSkeletonFormationGroupClasses,
  getJoinSlotSkeletonFormationTeamClasses,
  getJoinSlotSkeletonFormationSlotsGridClasses,
} from "./join-slot-utils";

interface JoinSlotPageProps {
  params: Promise<{ playerId: string }>;
}

export default function JoinSlotPage({ params }: JoinSlotPageProps) {
  return (
    <main className={getJoinSlotMainClasses()}>
      <header
        role="region"
        aria-label={getJoinSlotRegionAriaLabel("header")}
        className={getJoinSlotHeaderClasses()}
      >
        <Link
          href="/me"
          prefetch={true}
          className={getJoinSlotBackButtonClasses()}
          aria-label={getJoinSlotBackAriaLabel()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {getJoinSlotHeaderTitle()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getJoinSlotHeaderSubtitle()}
          </p>
        </div>
      </header>

      <Suspense fallback={<JoinSlotSkeleton />}>
        <JoinSlotContent params={params} />
      </Suspense>
    </main>
  );
}

interface MatchPlayerSlot {
  id: string;
  position: number;
  userId: string | null;
  displayName: string | null;
  teamId: string | null;
  resultConfirmed: boolean;
  joinedAt: Date | null;
  attendance: string | null;
  side: "RIGHT" | "LEFT" | null;
  user?: {
    id: string;
    displayName: string | null;
    image: string | null;
    alias: string | null;
  } | null;
  team?: {
    id: string;
    label: string;
  } | null;
}

interface MatchSlotDetails {
  id: string;
  position: number;
  userId: string | null;
  displayName: string | null;
  matchId: string;
  teamId: string | null;
  resultConfirmed: boolean;
  joinedAt: Date | null;
  attendance: string | null;
  side: "RIGHT" | "LEFT" | null;
  user?: {
    id: string;
    displayName: string | null;
    image: string | null;
    alias: string | null;
  } | null;
  team?: {
    id: string;
    label: string;
  } | null;
  match: {
    id: string;
    creatorId: string;
    status: MatchStatus;
    sets: number;
    matchType: string;
    club: string | null;
    courtNumber: string | null;
    notes: string | null;
    score: string | null;
    date: Date;
    createdAt: Date;
    creator?: {
      id: string;
      displayName: string | null;
      image: string | null;
      alias: string | null;
    } | null;
    players: MatchPlayerSlot[];
  };
}

async function JoinSlotContent({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const session = await auth();

  const player: MatchSlotDetails | null = (await getCachedMatchSlotDetails(playerId)) as MatchSlotDetails | null;

  if (!player) {
    notFound();
  }

  const match = player.match;
  const totalPlayers = match.players.length;
  const teamKey = teamKeyForPosition(player.position, totalPlayers);
  const teamLabel =
    player.team?.label ?? defaultTeamLabel(teamKey, totalPlayers);
  const viewerId = session?.user?.id ?? null;
  const slotTaken = Boolean(player.userId);
  const slotTakenByViewer = slotTaken && player.userId === viewerId;
  const viewerAlreadyInMatch = viewerId
    ? match.players.some((slot: { userId: string | null }) => slot.userId === viewerId)
    : false;
  const matchClosed = match.status !== MATCH_STATUS.PENDING;

  const teamGroups = groupMatchSlotsByTeam(match.players, totalPlayers);
  const helperMessage = getJoinSlotHelperMessage({
    slotTaken,
    slotTakenByViewer,
    matchClosed,
    viewerAlreadyInMatch,
  });

  const joinDisabled = Boolean(helperMessage) || !session?.user;

  const creatorName =
    match.creator?.alias ?? match.creator?.displayName ?? null;
  const invitationMessage = formatJoinSlotInvitationMessage(
    creatorName,
    teamLabel
  );

  return (
    <>
      <section
        role="region"
        aria-label={getJoinSlotRegionAriaLabel("invitation")}
        className={getJoinSlotInvitationCardClasses()}
      >
        <div className={getJoinSlotInvitationCardInnerClasses()}>
          <PlayerAvatar
            name={creatorName ?? getJoinSlotOrganizerFallbackName()}
            image={match.creator?.image ?? undefined}
            size={40}
            className={getJoinSlotInvitationAvatarClasses()}
          />
          <div className={getJoinSlotInvitationTextContainerClasses()}>
            <p className={getJoinSlotInvitationTitleClasses()}>
              {getJoinSlotInvitationLabel()}
            </p>
            <p className={getJoinSlotInvitationMessageClasses()}>
              {invitationMessage}
            </p>
          </div>
        </div>
      </section>

      <Card
        role="region"
        aria-label={getJoinSlotRegionAriaLabel("match-detail")}
        className={getJoinSlotMatchCardClasses()}
      >
        <CardHeader className={getJoinSlotMatchCardHeaderClasses()}>
          <CardTitle className={getJoinSlotMatchCardTitleClasses()}>
            {getJoinSlotMatchDetailTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className={getJoinSlotMatchCardContentClasses()}>
          <div className={getJoinSlotMatchCardMetricCellClasses()}>
            <div className={getJoinSlotMatchCardMetricHeaderClasses()}>
              <Trophy className="h-4 w-4" aria-hidden="true" />
              <span className={getJoinSlotMatchCardMetricTitleClasses()}>{getJoinSlotModalidadLabel()}</span>
            </div>
            <p className={getJoinSlotMatchCardMetricValueClasses()}>{formatMatchSetsText(match.sets)}</p>
          </div>
          <div className={getJoinSlotMatchCardMetricCellClasses()}>
            <div className={getJoinSlotMatchCardMetricHeaderClasses()}>
              <span className={getJoinSlotMatchCardMetricTitleClasses()}>{getJoinSlotEstadoLabel()}</span>
            </div>
            <div className={getJoinSlotMatchCardBadgeContainerClasses()}>
              <Badge
                variant={match.status === "CONFIRMED" ? "success" : "default"}
                className={getJoinSlotMatchCardStatusBadgeClasses()}
              >
                {formatStatus(match.status)}
              </Badge>
            </div>
          </div>
          {match.club && (
            <div className={getJoinSlotMatchCardClubRowClasses()}>
              <div className={getJoinSlotMatchCardClubIconContainerClasses()}>
                <MapPin className={getJoinSlotMatchCardClubIconClasses()} aria-hidden="true" />
              </div>
              <div className={getJoinSlotMatchCardClubInfoClasses()}>
                <p className={getJoinSlotMatchCardClubTitleClasses()}>
                  {match.club}{" "}
                  {getJoinSlotCourtText(match.courtNumber)}
                </p>
                <p className={getJoinSlotMatchCardClubSubtitleClasses()}>
                  {getJoinSlotClubSubtext()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <section
        role="region"
        aria-label={getJoinSlotRegionAriaLabel("formation")}
        className={getJoinSlotFormationSectionClasses()}
      >
        <div className={getJoinSlotFormationHeaderClasses()}>
          <h2 className={getJoinSlotFormationTitleClasses()}>
            {getJoinSlotFormationTitle()}
          </h2>
          <Users className={getJoinSlotFormationIconClasses()} aria-hidden="true" />
        </div>
        <div className={getJoinSlotFormationGridClasses()}>
          {(["A", "B"] as const).map((key) => {
            const slots = teamGroups[key];
            if (slots.length === 0) return null;
            const label =
              slots[0]?.team?.label ?? defaultTeamLabel(key, totalPlayers);

            return (
              <div key={key} className={getJoinSlotFormationTeamGroupClasses()}>
                <div className={getJoinSlotFormationTeamHeaderClasses()}>
                  <span className={getJoinSlotFormationTeamLabelClasses()}>
                    {label}
                  </span>
                  <div className={getJoinSlotFormationTeamDividerClasses()} />
                </div>
                <div className={getJoinSlotFormationTeamSlotsGridClasses()}>
                  {slots.map((slot) => {
                    const name =
                      slot.user?.alias ??
                      slot.user?.displayName ??
                      slot.displayName ??
                      formatFallbackSlotName(slot.position);
                    const isOccupied = Boolean(slot.userId);
                    const isViewer = slot.userId === viewerId;
                    const badgeProps = getSlotStatusBadgeProps(slot.resultConfirmed);

                    return (
                      <div
                        key={slot.id}
                        className={getJoinSlotSlotItemClasses(isViewer)}
                      >
                        <PlayerAvatar
                          name={name}
                          image={slot.user?.image ?? undefined}
                          size={40}
                          className={getJoinSlotFormationSlotAvatarClasses(isOccupied)}
                        />
                        <div className={getJoinSlotFormationSlotInfoClasses()}>
                          <p className={getJoinSlotSlotNameClasses(isOccupied)}>
                            {name}
                          </p>
                          <p className={getJoinSlotFormationSlotPositionClasses()}>
                            {formatSlotPositionText(slot.position)}
                          </p>
                        </div>
                        {isOccupied && (
                          <Badge
                            variant="outline"
                            className={getJoinSlotFormationSlotBadgeClasses(badgeProps.className)}
                          >
                            {badgeProps.text}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer
        role="region"
        aria-label={getJoinSlotRegionAriaLabel("footer")}
        className={getJoinSlotFooterContainerClasses()}
      >
        <div className={getJoinSlotFooterContentClasses()}>
          <div className={getJoinSlotFooterLayoutClasses()}>
            <div className={getJoinSlotFooterUserBadgeRowClasses()}>
              <div className={getJoinSlotFooterIconBadgeClasses()}>
                <UserCheck className={getJoinSlotFooterIconClasses()} aria-hidden="true" />
              </div>
              <div className={getJoinSlotFooterUserBadgeInfoClasses()}>
                <p className={getJoinSlotFooterUserBadgeTitleClasses()}>
                  {getJoinSlotJoiningAsLabel()}
                </p>
                <p className={getJoinSlotFooterUserBadgeTeamClasses()}>
                  {teamLabel}
                </p>
              </div>
            </div>

            {helperMessage && (
              <div className={getJoinSlotHelperWarningClasses()}>
                <AlertCircle className={getJoinSlotFooterWarningIconClasses()} aria-hidden="true" />
                <p className={getJoinSlotFooterWarningTextClasses()}>{helperMessage}</p>
              </div>
            )}

            <div className={getJoinSlotFooterActionStackClasses()}>
              {!session?.user ? (
                <SignInForm
                  callbackUrl={`/j/${playerId}`}
                  label={getSignInFormLabelForMatch(match.club)}
                  className={getJoinSlotSignInFormClasses()}
                />
              ) : slotTakenByViewer ? (
                <Button
                  asChild
                  variant="secondary"
                  className={getJoinSlotAlreadyJoinedButtonClasses()}
                >
                  <Link href={`/match/${match.id}`} prefetch={true}>
                    {getJoinSlotAlreadyJoinedButtonText()}
                  </Link>
                </Button>
              ) : (
                <JoinSlotButton
                  playerId={player.id}
                  matchId={match.id}
                  disabled={joinDisabled}
                  redirectOnSuccess={`/match/${match.id}`}
                />
              )}

              <Link
                href={`/match/${match.id}`}
                prefetch={true}
                className={getJoinSlotDetailLinkClasses()}
              >
                {getJoinSlotViewMatchDetailsText()}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export function JoinSlotSkeleton() {
  return (
    <section
      role="region"
      aria-busy="true"
      aria-label={getJoinSlotSkeletonAriaLabel()}
      className="space-y-6"
    >
      {/* Detail card skeleton */}
      <div className={getJoinSlotSkeletonCardClasses()}>
        <div className={getJoinSlotSkeletonCardHeaderClasses()}>
          <Skeleton className="h-4 w-28" />
        </div>
        <div className={getJoinSlotSkeletonCardContentClasses()}>
          <div className={getJoinSlotSkeletonCardCellClasses()}>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className={getJoinSlotSkeletonCardCellClasses()}>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>

      {/* Formation skeleton */}
      <div className={getJoinSlotSkeletonFormationClasses()}>
        <div className={getJoinSlotSkeletonFormationHeaderClasses()}>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-4" />
        </div>
        <div className={getJoinSlotSkeletonFormationGroupClasses()}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={getJoinSlotSkeletonFormationTeamClasses()}>
              <Skeleton className="h-3 w-16" />
              <div className={getJoinSlotSkeletonFormationSlotsGridClasses()}>
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
