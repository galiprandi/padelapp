
"use client";

import { Fragment, memo, type ReactNode } from "react";
import Link from "next/link";

import { PlayerAvatar } from "@/components/players/player-avatar";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Trophy, ChevronRight } from "lucide-react";

export interface MatchResultCardProps {
  label?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export function MatchResultCard({ label = "Resultado", children, footer }: MatchResultCardProps) {
  return (
    <div className="group relative rounded-3xl border border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <span className="absolute left-6 top-0 -translate-y-1/2 rounded-full border border-border/40 bg-background px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 shadow-sm z-10">
        {label}
      </span>
      <div className="min-h-24 rounded-3xl p-5 pt-8 text-sm text-muted-foreground">{children}</div>
      {footer ? <div className="border-t border-border/40 bg-background/30 px-5 py-3 text-xs text-muted-foreground">{footer}</div> : null}
    </div>
  );
}

export interface MatchResultCompactPlayer {
  id: string;
  position: number;
  displayName?: string | null;
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

export const MatchResultCompact = memo(function MatchResultCompact({ label = "Resultado", match, matchDate, detailUrl, viewerId: propViewerId }: MatchResultCompactProps) {
  const { data: session } = useSession();
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
      name: player.displayName ?? player.user?.displayName ?? `Jugador ${player.position + 1}`,
      image: player.user?.image ?? undefined,
    })),
    isWinner: winnerIndex === index,
  }));

  const segmentsToRender = totalSets > 0 ? totalSets : 1;
  const effectiveDate = matchDate ?? match.date ?? match.createdAt;
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

  const needsConfirmation = viewerId &&
    match.status !== "CONFIRMED" &&
    match.score &&
    match.players.some(p => p.user?.id === viewerId);

  const statusClassName = (() => {
    if (needsConfirmation) {
      return "bg-primary text-primary-foreground border-primary animate-pulse shadow-sm shadow-primary/40";
    }
    switch (statusLabel.toUpperCase()) {
      case "CONFIRMED":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "DISPUTED":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-secondary/20 text-secondary-foreground border-secondary/20";
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
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest transition-all", statusClassName)}>
                    {needsConfirmation ? "Confirmar resultado" : statusLabel === "PENDING" ? "Pendiente" : statusLabel === "CONFIRMED" ? "Confirmado" : statusLabel === "DISPUTED" ? "En disputa" : statusLabel}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/60">{formattedDate ?? "—"}</span>
                </div>
                {matchDetailUrl ? (
                  <Link href={matchDetailUrl} className="group/link flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-all">
                    Detalle
                    <ChevronRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
                  </Link>
                ) : null}
              </div>
            )
          : null
      }
    >
      <div className="space-y-4">
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
                      className={cn(
                        "border-2 border-background shadow-sm transition-transform group-hover:scale-105",
                        index === 0 ? "ml-0" : "-ml-3"
                      )}
                      size={36}
                    />
                  ))}
                </div>

                <div className="flex flex-col text-sm font-bold text-foreground min-w-0 leading-tight">
                  {team.players.map((player) => (
                    <div key={`team-${team.id}-name-${player.id}`} className="flex items-center gap-1.5 truncate">
                      <span className="truncate">{player.name}</span>
                      {team.isWinner && <Trophy className="h-3 w-3 shrink-0 text-yellow-500" />}
                    </div>
                  ))}
                </div>

                <div className="flex min-w-[104px] items-center justify-end gap-1.5 pl-3">
                  {indices.map((setIndex) => {
                    const rawValue = teamScores[setIndex];
                    const opponentRawValue = opponentScores[setIndex];
                    const numeric = typeof rawValue === "number" ? rawValue : Number(rawValue);
                    const opponentNumeric = typeof opponentRawValue === "number" ? opponentRawValue : Number(opponentRawValue);
                    const hasNumericValues = !Number.isNaN(numeric) && !Number.isNaN(opponentNumeric);
                    const didWinSet = hasNumericValues && numeric > opponentNumeric;
                    const isDraw = hasNumericValues && numeric === opponentNumeric;

                    let segmentClass = "bg-muted/20 text-muted-foreground/40 border-transparent";
                    if (hasNumericValues) {
                      if (didWinSet) {
                        segmentClass = "bg-primary text-primary-foreground shadow-md shadow-primary/20 border-primary scale-105 z-10";
                      } else if (isDraw) {
                        segmentClass = "bg-muted text-foreground border-border/20";
                      } else if (team.isWinner === false) {
                        segmentClass = "bg-muted/10 text-muted-foreground/50 border-transparent";
                      } else {
                        segmentClass = "bg-muted/40 text-foreground/80 border-border/20";
                      }
                    }

                    const displayValue = rawValue ?? "—";

                    return (
                      <span
                        key={`team-${team.id}-score-${setIndex}`}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl border text-lg font-black transition-all duration-300",
                          segmentClass
                        )}
                      >
                        {displayValue}
                      </span>
                    );
                  })}
                </div>
              </div>

              {!isLastTeam ? (
                <div className="relative h-px w-full bg-border/20" aria-hidden>
                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-[8px] font-black text-muted-foreground/30 uppercase tracking-tighter">
                    vs
                   </div>
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </MatchResultCard>
  );
});
