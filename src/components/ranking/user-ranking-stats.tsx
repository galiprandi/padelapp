import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, calculateWinRate } from "@/lib/utils";

interface UserRankingStatsProps {
  position: number | null;
  score: number;
  delta: number;
  wins: number;
  losses: number;
  level: number;
  attendanceScore?: number;
  className?: string;
  matchesPlayed?: number;
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
}: UserRankingStatsProps) {
  const winRate = calculateWinRate(wins, matchesPlayed);
  const reputationPercent = Math.round(attendanceScore * 100);

  return (
    <div
      className={cn("rounded-xl border border-border bg-card p-4", className)}
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
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              Nivel {level}
            </span>
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
              <div className="flex items-center gap-0.5 text-xs text-primary">
                <TrendingUp className="h-3 w-3" />
                <span>+{delta}</span>
              </div>
            ) : delta < 0 ? (
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3" />
                <span>{delta}</span>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 text-xs text-muted-foreground/50">
                <Minus className="h-3 w-3" />
                <span>0</span>
              </div>
            )}
          </div>
        </div>
      </div>
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
}: Partial<UserRankingStatsProps>) {
  const winRate = calculateWinRate(wins, matchesPlayed);
  const reputationPercent = Math.round(attendanceScore * 100);

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border border-border bg-card p-4",
        className,
      )}
    >
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
          <div className="flex items-center gap-0.5 text-xs text-primary">
            <TrendingUp className="h-3 w-3" />
            <span>+{delta}</span>
          </div>
        ) : delta && delta < 0 ? (
          <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <TrendingDown className="h-3 w-3" />
            <span>{delta}</span>
          </div>
        ) : (
          <div className="flex items-center gap-0.5 text-xs text-muted-foreground/50">
            <Minus className="h-3 w-3" />
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
  );
}
