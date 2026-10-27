import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JoinSlotButton } from "./join-slot-button";
import { getCachedMatchSlotDetails } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, UserCheck, Trophy, MapPin, Users, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
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
        <div className="flex items-center gap-3">
          <PlayerAvatar
            name={creatorName ?? "Organizador"}
            image={match.creator?.image ?? undefined}
            size={40}
            className="border border-border shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-muted-foreground">
              {getJoinSlotInvitationLabel()}
            </p>
            <p className="text-sm font-semibold text-foreground leading-snug">
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
        <CardHeader className="pb-4 pt-6 border-b border-border bg-muted">
          <CardTitle className="text-xs font-bold text-muted-foreground">
            {getJoinSlotMatchDetailTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-px bg-border p-0">
          <div className="bg-card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-semibold">Modalidad</span>
            </div>
            <p className="text-lg font-bold">{match.sets} sets</p>
          </div>
          <div className="bg-card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs font-semibold">Estado</span>
            </div>
            <div className="flex items-center pt-1">
              <Badge
                variant={match.status === "CONFIRMED" ? "success" : "default"}
                className="text-xs font-bold px-2 py-0.5 rounded border-border"
              >
                {formatStatus(match.status)}
              </Badge>
            </div>
          </div>
          {match.club && (
            <div className="col-span-2 bg-card p-4 flex items-center gap-4 border-t border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground border border-border shrink-0">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">
                  {match.club}{" "}
                  {getJoinSlotCourtText(match.courtNumber)}
                </p>
                <p className="text-xs text-muted-foreground">
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
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">
            {getJoinSlotFormationTitle()}
          </h2>
          <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="grid gap-6">
          {(["A", "B"] as const).map((key) => {
            const slots = teamGroups[key];
            if (slots.length === 0) return null;
            const label =
              slots[0]?.team?.label ?? defaultTeamLabel(key, totalPlayers);

            return (
              <div key={key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    {label}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid gap-2">
                  {slots.map((slot) => {
                    const name =
                      slot.user?.alias ??
                      slot.user?.displayName ??
                      slot.displayName ??
                      `Cupo ${slot.position + 1}`;
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
                          className={cn(
                            "border border-border shrink-0",
                            !isOccupied && "opacity-50"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={getJoinSlotSlotNameClasses(isOccupied)}>
                            {name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatSlotPositionText(slot.position)}
                          </p>
                        </div>
                        {isOccupied && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded",
                              badgeProps.className
                            )}
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
        <div className="max-w-md mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className={getJoinSlotFooterIconBadgeClasses()}>
                <UserCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-muted-foreground leading-none mb-1">
                  {getJoinSlotJoiningAsLabel()}
                </p>
                <p className="text-xl font-bold text-foreground truncate">
                  {teamLabel}
                </p>
              </div>
            </div>

            {helperMessage && (
              <div className={getJoinSlotHelperWarningClasses()}>
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <p className="text-xs font-bold">{helperMessage}</p>
              </div>
            )}

            <div className="space-y-3">
              {!session?.user ? (
                <SignInForm
                  callbackUrl={`/j/${playerId}`}
                  label={getSignInFormLabelForMatch(match.club)}
                  className="w-full h-12 rounded-lg text-base font-bold"
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
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-10 bg-muted border-b border-border flex items-center px-4">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="grid grid-cols-2 gap-px bg-border">
          <div className="bg-card p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="bg-card p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>

      {/* Formation skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <div className="grid gap-2">
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
