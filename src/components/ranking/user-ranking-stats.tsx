"use client";

import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { cn, calculateWinRate } from "@/lib/utils";
import { useMounted } from "@/lib/hooks/use-mounted";

interface UserRankingStatsProps {
  position: number | null;
  score: number;
  delta: number;
  wins: number;
  losses: number;
  level?: number;
  attendanceScore?: number;
  className?: string;
  matchesPlayed?: number;
  lastMatchAt?: Date | string | null;
}

export function UserRankingBanner({
  position,
  score,
  delta,
  wins,
  losses,
  level,
  attendanceScore = 1.0,
  className,
  matchesPlayed = 0,
  lastMatchAt,
}: UserRankingStatsProps) {
  const mounted = useMounted();
  const winRate = calculateWinRate(wins, matchesPlayed);
  const reputationPercent = Math.round(attendanceScore * 100);

  const lastMatchDate = lastMatchAt ? new Date(lastMatchAt) : null;
  let decayFactor: number | null = null;
  if (mounted && lastMatchDate) {
    const now = new Date();
    const diffTime = now.getTime() - lastMatchDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays > 120) {
      decayFactor = 0.25;
    } else if (diffDays > 60) {
      decayFactor = 0.5;
    }
  }

  return (
    <div
      className={cn("rounded-xl border border-border bg-card p-4 overflow-hidden", className)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Tu posición</span>
            <span className="text-2xl font-bold text-foreground">
              {position ? `#${position}` : "S/P"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Puntos</span>
            <span className="text-2xl font-bold text-foreground">
              {Math.round(score)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            {matchesPlayed > 0 && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                {winRate}% WR
              </span>
            )}
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
              {reputationPercent}% Rep
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {wins}V-{losses}D
            </span>
            {delta > 0 ? (
              <div
                className="flex items-center gap-0.5 text-xs text-primary"
                aria-label={`Subió ${delta} posiciones`}
              >
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
                <span>+{delta}</span>
              </div>
            ) : delta < 0 ? (
              <div
                className="flex items-center gap-0.5 text-xs text-muted-foreground"
                aria-label={`Bajó ${Math.abs(delta)} posiciones`}
              >
                <TrendingDown className="h-3 w-3" aria-hidden="true" />
                <span>{delta}</span>
              </div>
            ) : (
              <div
                className="flex items-center gap-0.5 text-xs text-muted-foreground/50"
                aria-label="Posición sin cambios"
              >
                <Minus className="h-3 w-3" aria-hidden="true" />
                <span>0</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {decayFactor && (
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-500/5 -mx-4 -mb-4 p-3 rounded-b-xl border-t-0">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>
            {decayFactor === 0.25
              ? "Puntos reducidos al 25% por inactividad (más de 120 días)"
              : "Puntos reducidos al 50% por inactividad (más de 60 días)"}
          </span>
        </div>
      )}
    </div>
  );
}

export function UserRankingCard({
  position,
  score,
  delta,
  level,
  attendanceScore = 1.0,
  className,
  wins = 0,
  losses = 0,
  matchesPlayed = 0,
  lastMatchAt,
}: Partial<UserRankingStatsProps>) {
  const mounted = useMounted();
  const winRate = calculateWinRate(wins, matchesPlayed);
  const reputationPercent = Math.round(attendanceScore * 100);

  const lastMatchDate = lastMatchAt ? new Date(lastMatchAt) : null;
  let decayFactor: number | null = null;
  if (mounted && lastMatchDate) {
    const now = new Date();
    const diffTime = now.getTime() - lastMatchDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays > 120) {
      decayFactor = 0.25;
    } else if (diffDays > 60) {
      decayFactor = 0.5;
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-4 overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">Mi posición</span>
          <span className="text-2xl font-bold text-foreground">
            {position ? `#${position}` : "--"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground">
            {Math.round(score ?? 1000)} pts
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {matchesPlayed > 0 && (
              <span className="text-xs font-bold text-primary">{winRate}% WR</span>
            )}
            <span className="text-xs font-medium text-muted-foreground">
              {reputationPercent}% Rep
            </span>
          </div>
        </div>
      </div>

        <div className="flex flex-col items-end gap-1.5">
          {delta && delta > 0 ? (
            <div
              className="flex items-center gap-0.5 text-xs text-primary"
              aria-label={`Subió ${delta} posiciones`}
            >
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
              <span>+{delta}</span>
            </div>
          ) : delta && delta < 0 ? (
            <div
              className="flex items-center gap-0.5 text-xs text-muted-foreground"
              aria-label={`Bajó ${Math.abs(delta)} posiciones`}
            >
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
              <span>{delta}</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-0.5 text-xs text-muted-foreground/50"
              aria-label="Posición sin cambios"
            >
              <Minus className="h-3 w-3" aria-hidden="true" />
              <span>0</span>
            </div>
          )}
          {matchesPlayed > 0 && (
            <span className="text-xs text-muted-foreground">
              {wins}V-{losses}D
            </span>
          )}
        </div>
      </div>
      {decayFactor && (
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-500/5 -mx-4 -mb-4 p-3 rounded-b-xl border-t-0">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>
            {decayFactor === 0.25
              ? "Puntos reducidos al 25% por inactividad (más de 120 días)"
              : "Puntos reducidos al 50% por inactividad (más de 60 días)"}
          </span>
        </div>
      )}
    </div>
  );
}
