"use client";

import { useState, useTransition } from "react";
import { TrendingUp, TrendingDown, Minus, Calendar, Award, AlertTriangle, Flame, RefreshCw, Trophy, Sparkles } from "lucide-react";
import { cn, calculateWinRate } from "@/lib/utils";
import { useMounted } from "@/lib/hooks/use-mounted";
import { getUserRankingBreakdownAction } from "@/app/(app)/ranking/actions";

interface RankingBreakdownData {
  basePoints: number;
  wins: number;
  losses: number;
  winPoints: number;
  streak: number;
  streakPoints: number;
  setsWonBonus: number;
  lateCount: number;
  latePenalty: number;
  noShowCount: number;
  noShowPenalty: number;
  decayFactor: number;
  finalScore: number;
  lastMatchAt: Date | null;
}

interface UserRankingStatsProps {
  userId?: string;
  position: number | null;
  score: number;
  delta: number;
  wins: number;
  losses: number;
  attendanceScore?: number;
  className?: string;
  matchesPlayed?: number;
  lastMatchAt?: Date | string | null;
}

function RankingBreakdown({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [breakdown, setBreakdown] = useState<RankingBreakdownData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    if (!isOpen && !breakdown && !isPending) {
      startTransition(async () => {
        setError(null);
        const res = await getUserRankingBreakdownAction(userId);
        if (res.status === "ok" && res.breakdown) {
          setBreakdown(res.breakdown);
        } else {
          setError(res.message || "Error al cargar el desglose.");
        }
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-primary bg-muted rounded-lg border border-border hover:bg-muted/80 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        aria-expanded={isOpen}
      >
        {isPending ? (
          <>
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Cargando desglose...</span>
          </>
        ) : isOpen ? (
          "Ocultar desglose de puntos 📊"
        ) : (
          "Ver desglose de puntos 📊"
        )}
      </button>

      {isOpen && (
        <div className="mt-3 p-3 rounded-lg bg-muted border border-border space-y-2.5 text-xs">
          {error && (
            <p className="text-rose-500 font-semibold text-center">{error}</p>
          )}

          {isPending && (
            <div className="space-y-2 py-1">
              <div className="h-4 bg-muted-foreground/10 rounded animate-pulse w-full" />
              <div className="h-4 bg-muted-foreground/10 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-muted-foreground/10 rounded animate-pulse w-4/5" />
            </div>
          )}

          {!isPending && breakdown && (
            <>
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" /> Puntos base iniciales
                </span>
                <span className="font-bold text-foreground">+{breakdown.basePoints} pts</span>
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5" /> Victorias ({breakdown.wins})
                </span>
                <span className="font-bold text-foreground">
                  {breakdown.winPoints > 0 ? `+${breakdown.winPoints}` : "0"} pts
                </span>
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" /> Racha actual ({breakdown.streak} 🔥)
                </span>
                <span className="font-bold text-foreground">
                  {breakdown.streakPoints > 0 ? `+${breakdown.streakPoints}` : "0"} pts
                </span>
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Bonus por sets ganados
                </span>
                <span className="font-bold text-foreground">
                  {breakdown.setsWonBonus > 0 ? `+${breakdown.setsWonBonus}` : "0"} pts
                </span>
              </div>

              {breakdown.lateCount > 0 && (
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="h-3.5 w-3.5" /> Llegadas tarde ({breakdown.lateCount})
                  </span>
                  <span className="font-bold text-amber-600">-{breakdown.latePenalty} pts</span>
                </div>
              )}

              {breakdown.noShowCount > 0 && (
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-1 text-rose-600">
                    <AlertTriangle className="h-3.5 w-3.5" /> Ausencias sin aviso ({breakdown.noShowCount})
                  </span>
                  <span className="font-bold text-rose-600">-{breakdown.noShowPenalty} pts</span>
                </div>
              )}

              {breakdown.decayFactor < 1.0 && (
                <div className="flex justify-between items-center text-amber-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Decay por inactividad
                  </span>
                  <span>x{breakdown.decayFactor}</span>
                </div>
              )}

              <div className="pt-2 border-t border-border flex justify-between items-center font-bold text-sm text-foreground">
                <span>Puntaje recalculado</span>
                <span className="text-primary">{Math.round(breakdown.finalScore)} pts</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function UserRankingBanner({
  userId,
  position,
  score,
  delta,
  wins,
  losses,
  attendanceScore = 1.0,
  className,
  matchesPlayed = 0,
  lastMatchAt,
}: UserRankingStatsProps) {
  console.log("UserRankingBanner rendered with userId:", userId);
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

      {userId && <RankingBreakdown userId={userId} />}
    </div>
  );
}

export function UserRankingCard({
  userId,
  position,
  score,
  delta,
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

      {userId && <RankingBreakdown userId={userId} />}
    </div>
  );
}
