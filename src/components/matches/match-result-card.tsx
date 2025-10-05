
import { Fragment, type ReactNode } from "react";

import { PlayerAvatar } from "@/components/players/player-avatar";
import { cn } from "@/lib/utils";

export interface MatchResultCardProps {
  label?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export function MatchResultCard({ label = "Resultado", children, footer }: MatchResultCardProps) {
  return (
    <div className="relative rounded-xl border border-border/80 bg-muted/30">
      <span className="absolute left-4 top-0 -translate-y-1/2 rounded-full bg-background px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="min-h-24 rounded-xl p-4 pt-6 text-sm text-muted-foreground">{children}</div>
      {footer ? <div className="border-t border-border/60 bg-background px-4 py-3 text-xs text-muted-foreground">{footer}</div> : null}
    </div>
  );
}

export interface MatchResultCompactPlayer {
  id: string;
  position: number;
  user?: {
    id: string;
    displayName: string | null;
    image?: string | null;
  } | null;
}

export type MatchResultCompactStatus = "PENDING" | "CONFIRMED" | "DISPUTED" | string;

export interface MatchResultCompactMatch {
  id: string;
  createdAt: Date | string;
  score?: string | null;
  players: MatchResultCompactPlayer[];
  status?: MatchResultCompactStatus | null;
}

export interface MatchResultCompactProps {
  label?: string;
  match: MatchResultCompactMatch;
  matchDate?: Date | string;
  detailUrl?: string;
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

export function MatchResultCompact({ label = "Resultado", match, matchDate, detailUrl }: MatchResultCompactProps) {
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

  const winnerIndex = setWins[0] === setWins[1] ? undefined : setWins[0] > setWins[1] ? 0 : 1;

  const sortedPlayers = [...match.players].sort((a, b) => a.position - b.position);
  const teamsPlayers = [
    sortedPlayers.filter((player) => player.position < 2),
    sortedPlayers.filter((player) => player.position >= 2),
  ];

  const normalizedTeams = teamsPlayers.map((teamPlayers, index) => ({
    id: `${match.id}-team-${index}`,
    players: teamPlayers.map((player) => ({
      id: player.id,
      name: player.user?.displayName ?? `Jugador ${player.position + 1}`,
      image: player.user?.image ?? undefined,
    })),
    isWinner: winnerIndex === index,
  }));

  const segmentsToRender = totalSets > 0 ? totalSets : 1;
  const effectiveDate = matchDate ?? match.createdAt;
  const parsedDate = effectiveDate
    ? effectiveDate instanceof Date
      ? effectiveDate
      : new Date(effectiveDate)
    : null;
  const formattedDate = parsedDate && !Number.isNaN(parsedDate.getTime())
    ? new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }).format(parsedDate)
    : null;
  const matchDetailUrl = detailUrl ?? `/match/${match.id}`;
  const statusLabel = (match.status ?? "PENDING").toString();
  const statusClassName = (() => {
    switch (statusLabel.toUpperCase()) {
      case "CONFIRMED":
        return "bg-emerald-500/15 text-emerald-600";
      case "DISPUTED":
        return "bg-amber-500/15 text-amber-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  })();

  return (
    <MatchResultCard
      label={label}
      footer={
        formattedDate || matchDetailUrl
          ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide", statusClassName)}>
                    {statusLabel === "PENDING" ? "Pendiente" : statusLabel === "CONFIRMED" ? "Confirmado" : statusLabel === "DISPUTED" ? "En disputa" : statusLabel}
                  </span>
                  <span className="font-medium text-foreground">{formattedDate ?? "—"}</span>
                </div>
                {matchDetailUrl ? (
                  <a href={matchDetailUrl} className="text-primary underline-offset-2 hover:underline">
                    Ver detalle
                  </a>
                ) : null}
              </div>
            )
          : null
      }
    >
      <div className="space-y-3">
        {normalizedTeams.map((team, teamIndex) => {
          const isLastTeam = teamIndex === normalizedTeams.length - 1;
          const indices = Array.from({ length: segmentsToRender }, (_, idx) => idx);
          const teamScores = scoresMatrix[teamIndex] ?? [];
          const opponentScores = scoresMatrix[(teamIndex + 1) % normalizedTeams.length] ?? [];

          return (
            <Fragment key={team.id}>
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <div className="flex items-center">
                  {team.players.map((player, index) => (
                    <PlayerAvatar
                      key={`team-${team.id}-player-${player.id}`}
                      name={player.name}
                      image={player.image ?? undefined}
                      className={cn("border-2 border-background", index === 0 ? "ml-0" : "-ml-2.5")}
                    />
                  ))}
                </div>

                <div className="flex flex-col text-sm font-medium text-foreground">
                  {team.players.map((player) => (
                    <span key={`team-${team.id}-name-${player.id}`}>{player.name}</span>
                  ))}
                </div>

                <div className="flex min-w-[104px] items-center justify-end gap-1 pl-3">
                  {indices.map((setIndex) => {
                    const rawValue = teamScores[setIndex];
                    const opponentRawValue = opponentScores[setIndex];
                    const numeric = typeof rawValue === "number" ? rawValue : Number(rawValue);
                    const opponentNumeric = typeof opponentRawValue === "number" ? opponentRawValue : Number(opponentRawValue);
                    const hasNumericValues = !Number.isNaN(numeric) && !Number.isNaN(opponentNumeric);
                    const didWinSet = hasNumericValues && numeric > opponentNumeric;
                    const isDraw = hasNumericValues && numeric === opponentNumeric;

                    let segmentClass = "bg-muted text-muted-foreground";
                    if (hasNumericValues) {
                      if (didWinSet) {
                        segmentClass = "bg-primary text-primary-foreground";
                      } else if (isDraw) {
                        segmentClass = "bg-muted text-foreground";
                      } else if (team.isWinner === false) {
                        segmentClass = "bg-muted/70 text-muted-foreground";
                      } else {
                        segmentClass = "bg-muted text-foreground";
                      }
                    }

                    const displayValue = rawValue ?? "—";

                    return (
                      <span
                        key={`team-${team.id}-score-${setIndex}`}
                        className={cn("rounded-md px-2 py-0.5 text-base font-bold", segmentClass)}
                      >
                        {displayValue}
                      </span>
                    );
                  })}
                </div>
              </div>

              {!isLastTeam ? <div className="mx-auto h-px w-[30%] bg-border" aria-hidden /> : null}
            </Fragment>
          );
        })}
      </div>
    </MatchResultCard>
  );
}
