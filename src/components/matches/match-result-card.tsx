"use client";

import { Fragment, memo, type ReactNode, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PlayerAvatar } from "@/components/players/player-avatar";
import { cn, isToday, capitalizeName } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Trophy, ChevronRight, Check, Loader2 } from "lucide-react";
import { ShareButton } from "@/components/share/share-button";
import { Badge } from "@/components/ui/badge";
import { confirmMatchResultAction } from "@/app/(app)/match/actions";
import { createMagicLink } from "@/lib/magic-link";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useToast } from "@/components/toast/use-toast";
import { parseScoreSets, calculateMatchSetWins } from "@/lib/match-helpers";
import {
  getMatchQuickConfirmSuccessToast,
  getMatchQuickConfirmErrorToast,
  getMatchQuickConfirmButtonAriaLabel,
  getMatchQuickConfirmButtonText,
  getMatchShareTitle,
  getMatchShareButtonAriaLabel,
  getMatchDetailLinkText,
  getMatchVersusSeparatorText,
  getMatchScorePlaceholderText,
  getMatchTeamPlayerNameText,
  getMatchStatusBadgeText,
  getMatchStatusBadgeVariant,
  getMatchDetailLinkAriaLabel,
  getMatchPlayerSideLabel,
  getMatchPlayerAvatarAriaLabel,
  getMatchResultCardRegionAriaLabel,
  getMatchResultCardContainerClasses,
  getMatchResultCardHeaderClasses,
  getMatchResultCardTitleClasses,
  getMatchResultCardContentClasses,
  getMatchResultCardFooterClasses,
  getMatchQuickConfirmButtonClasses,
  getMatchShareButtonClasses,
  getMatchDetailLinkClasses,
  getMatchTeamContainerClasses,
  getMatchPlayerAvatarClasses,
  getMatchPlayerNameClasses,
  getMatchSideBadgeClasses,
  getMatchScoreSegmentClasses,
  getMatchVersusDividerClasses,
} from "./match-result-card-utils";

export interface MatchResultCardProps {
  label?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export function MatchResultCard({
  label = "Resultado",
  children,
  footer,
}: MatchResultCardProps) {
  return (
    <div
      role="region"
      aria-label={getMatchResultCardRegionAriaLabel(label)}
      className={getMatchResultCardContainerClasses()}
    >
      <div className={getMatchResultCardHeaderClasses()}>
        <span className={getMatchResultCardTitleClasses()}>
          {label}
        </span>
      </div>
      <div className={getMatchResultCardContentClasses()}>{children}</div>
      {footer ? (
        <div className={getMatchResultCardFooterClasses()}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export interface MatchResultCompactPlayer {
  id: string;
  position: number;
  displayName?: string | null;
  resultConfirmed?: boolean;
  side?: "RIGHT" | "LEFT" | null;
  user?: {
    id: string;
    displayName: string | null;
    alias?: string | null;
    image?: string | null;
  } | null;
}

export type MatchResultCompactStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DISPUTED"
  | string;

export interface MatchResultCompactMatch {
  id: string;
  createdAt: Date | string;
  score?: string | null;
  players: MatchResultCompactPlayer[];
  status?: MatchResultCompactStatus | null;
  date?: Date | string;
}

export interface MatchResultCompactProps {
  label?: string;
  match: MatchResultCompactMatch;
  matchDate?: Date | string;
  detailUrl?: string;
  viewerId?: string;
  showDetailLink?: boolean;
}

export const MatchResultCompact = memo(function MatchResultCompact({
  label = "Resultado",
  match,
  matchDate,
  detailUrl,
  viewerId: propViewerId,
  showDetailLink = true,
}: MatchResultCompactProps) {
  const { data: session } = useSession();
  const mounted = useMounted();
  const router = useRouter();
  const { showToast } = useToast();
  const [isConfirming, startTransition] = useTransition();
  const viewerId = propViewerId ?? session?.user?.id;
  const parsedSets = parseScoreSets(match.score);
  const { winnerIndex } = calculateMatchSetWins(parsedSets);
  const scoresMatrix: Array<Array<number>> = [[], []];

  parsedSets.forEach(([teamAScore, teamBScore]) => {
    scoresMatrix[0].push(teamAScore);
    scoresMatrix[1].push(teamBScore);
  });

  const totalSets = Math.max(scoresMatrix[0].length, scoresMatrix[1].length);

  const sortedPlayers = [...match.players].sort(
    (a, b) => a.position - b.position,
  );
  const teamsPlayers = [
    sortedPlayers.filter((player) => player.position < 2),
    sortedPlayers.filter((player) => player.position >= 2),
  ];

  const normalizedTeams = teamsPlayers.map((teamPlayers, index) => ({
    id: `${match.id}-team-${index}`,
    players: teamPlayers.map((player) => ({
      id: player.id,
      userId: player.user?.id,
      name: capitalizeName(
        player.user?.displayName ??
        player.displayName ??
        player.user?.alias ??
        `Jugador ${player.position + 1}`,
      ),
      image: player.user?.image ?? undefined,
      side: player.side,
    })),
    isWinner: winnerIndex === index,
    hasViewer: teamPlayers.some((p) => p.user?.id === viewerId),
  }));

  const segmentsToRender = totalSets > 0 ? totalSets : 1;
  const effectiveDate = matchDate ?? match.date ?? match.createdAt;
  const parsedDate = effectiveDate
    ? effectiveDate instanceof Date
      ? effectiveDate
      : new Date(effectiveDate)
    : null;
  // Only compute date-relative labels after mount to avoid hydration
  // mismatch (server uses UTC, client uses local timezone).
  const isTodayDate = mounted && parsedDate ? isToday(parsedDate) : false;

  // Gate the entire formattedDate behind mounted — Intl.DateTimeFormat
  // without explicit timeZone uses the runtime's local timezone, which
  // differs between server (UTC) and client (local).
  const formattedDate =
    mounted && parsedDate && !Number.isNaN(parsedDate.getTime())
      ? isTodayDate
        ? parsedDate.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Intl.DateTimeFormat("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }).format(parsedDate)
      : null;
  const matchDetailUrl = detailUrl ?? `/match/${match.id}`;
  const statusLabel = (match.status ?? "PENDING").toString();
  const isConfirmed = statusLabel === "CONFIRMED";

  const needsConfirmation = Boolean(
    viewerId &&
    match.status !== "CONFIRMED" &&
    match.score &&
    match.players.some((p) => p.user?.id === viewerId && !p.resultConfirmed)
  );

  const statusVariant = getMatchStatusBadgeVariant(statusLabel, needsConfirmation);
  const statusText = getMatchStatusBadgeText(statusLabel, needsConfirmation);

  const handleQuickConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const res = await confirmMatchResultAction(match.id);
      if (res.status === "ok") {
        showToast(getMatchQuickConfirmSuccessToast(), { type: "success" });
        router.refresh();
      } else {
        showToast(getMatchQuickConfirmErrorToast(res.message), { type: "error" });
      }
    });
  };

  return (
    <MatchResultCard
      label={label}
      footer={
        formattedDate || matchDetailUrl ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant}>
                {statusText}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formattedDate ?? getMatchScorePlaceholderText()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {needsConfirmation && (
                <button
                  onClick={handleQuickConfirm}
                  disabled={isConfirming}
                  aria-busy={isConfirming}
                  aria-label={getMatchQuickConfirmButtonAriaLabel(match.score)}
                  className={getMatchQuickConfirmButtonClasses()}
                >
                  {isConfirming ? (
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  ) : (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  )}
                  {getMatchQuickConfirmButtonText(isConfirming)}
                </button>
              )}
              {isConfirmed && match.score && (
                <ShareButton
                  url={
                    createMagicLink({ resource: "match", identifier: match.id })
                      .url
                  }
                  title={getMatchShareTitle()}
                  shareData={{
                    type: "match-result",
                    club: "", // Club not available directly on compact match object in this prop structure, but getNaturalShareText handles empty string clean
                    date: match.date ?? match.createdAt ?? new Date(),
                    score: match.score,
                  }}
                  variant="ghost"
                  size="icon"
                  iconOnly
                  aria-label={getMatchShareButtonAriaLabel()}
                  className={getMatchShareButtonClasses()}
                />
              )}
              {showDetailLink && matchDetailUrl ? (
                <Link
                  href={matchDetailUrl}
                  prefetch={true}
                  className={getMatchDetailLinkClasses()}
                  aria-label={getMatchDetailLinkAriaLabel(formattedDate)}
                >
                  {getMatchDetailLinkText()}
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>
        ) : null
      }
    >
      <div className="space-y-2">
        {normalizedTeams.map((team, teamIndex) => {
          const isLastTeam = teamIndex === normalizedTeams.length - 1;
          const indices = Array.from(
            { length: segmentsToRender },
            (_, idx) => idx,
          );
          const teamScores = scoresMatrix[teamIndex] ?? [];
          const opponentScores =
            scoresMatrix[(teamIndex + 1) % normalizedTeams.length] ?? [];

          return (
            <Fragment key={team.id}>
              <div className={getMatchTeamContainerClasses(team.hasViewer)}>
                <div className="flex items-center">
                  {team.players.map((player, index) => {
                    const avatarElement = (
                      <PlayerAvatar
                        name={player.name}
                        image={player.image ?? undefined}
                        className={getMatchPlayerAvatarClasses(index)}
                        size={32}
                      />
                    );

                    return player.userId ? (
                      <Link
                        key={`team-${team.id}-player-${player.id}`}
                        href={`/p/${player.userId}`}
                        prefetch={true}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-full z-10 hover:z-20 relative"
                        aria-label={getMatchPlayerAvatarAriaLabel(player.name)}
                      >
                        {avatarElement}
                      </Link>
                    ) : (
                      <div key={`team-${team.id}-player-${player.id}`}>
                        {avatarElement}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col text-sm font-semibold text-foreground min-w-0 leading-tight">
                  {team.players.map((player) => {
                    const isViewer = player.userId === viewerId;
                    const sideInfo = player.side ? getMatchPlayerSideLabel(player.side) : null;

                    return (
                      <div
                        key={`team-${team.id}-name-${player.id}`}
                        className="flex items-center gap-1.5 truncate"
                      >
                        {player.userId ? (
                          <Link
                            href={`/p/${player.userId}`}
                            prefetch={true}
                            className={getMatchPlayerNameClasses(isViewer)}
                          >
                            {getMatchTeamPlayerNameText(isViewer, player.name)}
                          </Link>
                        ) : (
                          <span className="truncate">{player.name}</span>
                        )}
                        {sideInfo && (
                          <span
                            className={getMatchSideBadgeClasses()}
                            title={sideInfo.title}
                            aria-label={sideInfo.title}
                          >
                            {sideInfo.label}
                          </span>
                        )}
                        {team.isWinner && (
                          <Trophy className="h-3 w-3 shrink-0 text-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-1 pl-2">
                  {indices.map((setIndex) => {
                    const rawValue = teamScores[setIndex];
                    const opponentRawValue = opponentScores[setIndex];
                    const numeric =
                      typeof rawValue === "number"
                        ? rawValue
                        : Number(rawValue);
                    const opponentNumeric =
                      typeof opponentRawValue === "number"
                        ? opponentRawValue
                        : Number(opponentRawValue);
                    const hasNumericValues =
                      !Number.isNaN(numeric) && !Number.isNaN(opponentNumeric);
                    const didWinSet =
                      hasNumericValues && numeric > opponentNumeric;

                    const segmentClass = hasNumericValues
                      ? didWinSet
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                      : "bg-muted text-muted-foreground/60";

                    return (
                      <span
                        key={`team-${team.id}-score-${setIndex}`}
                        className={getMatchScoreSegmentClasses(hasNumericValues, didWinSet)}
                      >
                        {rawValue ?? getMatchScorePlaceholderText()}
                      </span>
                    );
                  })}
                </div>
              </div>

              {!isLastTeam ? (
                <div className={getMatchVersusDividerClasses()}>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {getMatchVersusSeparatorText()}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </MatchResultCard>
  );
});
