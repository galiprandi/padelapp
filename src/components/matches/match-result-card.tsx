"use client";

import { Fragment, memo, type ReactNode, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PlayerAvatar } from "@/components/players/player-avatar";
import { cn, isToday, isTomorrow } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Trophy, ChevronRight, Share2, Check, Loader2 } from "lucide-react";
import { ShareButton } from "@/components/share/share-button";
import { confirmMatchResultAction } from "@/app/(app)/match/actions";
import { createMagicLink } from "@/lib/magic-link";

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
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-4 py-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="p-4 text-sm text-muted-foreground">{children}</div>
      {footer ? (
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
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
  user?: {
    id: string;
    displayName: string | null;
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
}

function parseScoreSets(score?: string | null): Array<[number, number]> {
  if (!score) {
    return [];
  }

  return score
    .split(",")
    .map((segment) => segment.trim())
    .map((segment) => segment.replace(/[\[\]]/g, ""))
    .map((segment) => {
      const match = segment.match(/(\d+)[^\d]+(\d+)/);
      if (!match) {
        return null;
      }
      return [Number(match[1]), Number(match[2])];
    })
    .filter((value): value is [number, number] => Array.isArray(value));
}

export const MatchResultCompact = memo(function MatchResultCompact({
  label = "Resultado",
  match,
  matchDate,
  detailUrl,
  viewerId: propViewerId,
}: MatchResultCompactProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isConfirming, startTransition] = useTransition();
  const viewerId = propViewerId ?? session?.user?.id;
  const parsedSets = parseScoreSets(match.score);
  const scoresMatrix: Array<Array<number>> = [[], []];

  parsedSets.forEach(([teamAScore, teamBScore]) => {
    scoresMatrix[0].push(teamAScore);
    scoresMatrix[1].push(teamBScore);
  });

  const totalSets = Math.max(scoresMatrix[0].length, scoresMatrix[1].length);
  const setWins = [0, 0];

  parsedSets.forEach(([teamAScore, teamBScore]) => {
    if (teamAScore > teamBScore) {
      setWins[0] += 1;
    } else if (teamBScore > teamAScore) {
      setWins[1] += 1;
    }
  });

  const winnerIndex =
    setWins[0] === setWins[1] ? undefined : setWins[0] > setWins[1] ? 0 : 1;

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
      name:
        player.displayName ??
        player.user?.displayName ??
        `Jugador ${player.position + 1}`,
      image: player.user?.image ?? undefined,
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
  const isTodayDate = parsedDate ? isToday(parsedDate) : false;
  const isTomorrowDate = parsedDate ? isTomorrow(parsedDate) : false;

  const formattedDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
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

  const needsConfirmation =
    viewerId &&
    match.status !== "CONFIRMED" &&
    match.score &&
    match.players.some((p) => p.user?.id === viewerId && !p.resultConfirmed);

  const statusClassName = (() => {
    if (needsConfirmation) {
      return "bg-primary text-primary-foreground";
    }
    switch (statusLabel.toUpperCase()) {
      case "CONFIRMED":
        return "bg-primary/10 text-primary";
      case "DISPUTED":
        return "bg-amber-500/10 text-amber-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  })();

  const handleQuickConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const res = await confirmMatchResultAction(match.id);
      if (res.status === "ok") {
        router.refresh();
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
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-semibold",
                  statusClassName,
                )}
              >
                {needsConfirmation
                  ? "Confirmar"
                  : statusLabel === "PENDING"
                    ? "Pendiente"
                    : statusLabel === "CONFIRMED"
                      ? "Confirmado"
                      : statusLabel === "DISPUTED"
                        ? "Disputa"
                        : statusLabel}
              </span>
              <span className="text-xs text-muted-foreground">
                {formattedDate ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {needsConfirmation && (
                <button
                  onClick={handleQuickConfirm}
                  disabled={isConfirming}
                  className="flex items-center gap-1 bg-primary text-primary-foreground px-2.5 py-1 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isConfirming ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  Confirmar
                </button>
              )}
              {isConfirmed && match.score && (
                <ShareButton
                  url={
                    createMagicLink({ resource: "match", identifier: match.id })
                      .url
                  }
                  title="Resultado de Pádel"
                  text={`Mirá el resultado: ${match.score}`}
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label="Compartir resultado"
                  className="h-7 w-7 rounded-md text-primary hover:bg-primary/10"
                />
              )}
              {matchDetailUrl ? (
                <Link
                  href={matchDetailUrl}
                  className="flex items-center gap-0.5 text-xs font-semibold text-primary"
                >
                  Detalle
                  <ChevronRight className="h-3 w-3" />
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
              <div
                className={cn(
                  "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg p-2",
                  team.hasViewer && "bg-primary/5",
                  team.isWinner && "bg-primary/5",
                )}
              >
                <div className="flex items-center">
                  {team.players.map((player, index) => (
                    <PlayerAvatar
                      key={`team-${team.id}-player-${player.id}`}
                      name={player.name}
                      image={player.image ?? undefined}
                      className={cn(
                        "border-2 border-card",
                        index === 0 ? "ml-0" : "-ml-2",
                      )}
                      size={32}
                    />
                  ))}
                </div>

                <div className="flex flex-col text-sm font-semibold text-foreground min-w-0 leading-tight">
                  {team.players.map((player) => {
                    const isViewer = player.userId === viewerId;
                    return (
                      <div
                        key={`team-${team.id}-name-${player.id}`}
                        className="flex items-center gap-1 truncate"
                      >
                        {player.userId ? (
                          <Link
                            href={`/p/${player.userId}`}
                            className={cn(
                              "truncate hover:text-primary",
                              isViewer && "text-primary",
                            )}
                          >
                            {isViewer ? "Tú" : player.name}
                          </Link>
                        ) : (
                          <span className="truncate">{player.name}</span>
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
                      : "bg-muted/50 text-muted-foreground";

                    return (
                      <span
                        key={`team-${team.id}-score-${setIndex}`}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold",
                          segmentClass,
                        )}
                      >
                        {rawValue ?? "—"}
                      </span>
                    );
                  })}
                </div>
              </div>

              {!isLastTeam ? (
                <div className="flex items-center gap-2 py-0.5">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium text-muted-foreground">
                    vs
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
