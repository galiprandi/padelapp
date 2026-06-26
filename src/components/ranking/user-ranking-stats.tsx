import { TrendingUp, TrendingDown, Minus, Trophy, Target, Activity } from "lucide-react";
import { cn, calculateWinRate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface UserRankingStatsProps {
  position: number | null;
  score: number;
  delta: number;
  wins: number;
  losses: number;
  level: number;
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
  className,
  matchesPlayed = 0,
}: UserRankingStatsProps) {
  const winRate = calculateWinRate(wins, matchesPlayed);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/5 p-8 shadow-xl backdrop-blur-md",
        className
      )}
    >
      <div className="relative z-10 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/60">
            Tu Ranking Actual
          </span>
          <div className="flex items-baseline gap-3">
            <h2 className="text-5xl font-black text-foreground tracking-tighter">
              {position ? `#${position}` : "S/P"}
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/50 border border-border/20 backdrop-blur-sm shadow-sm">
              {delta > 0 ? (
                <div className="flex items-center text-emerald-500">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[11px] font-black ml-0.5">+{delta}</span>
                </div>
              ) : delta < 0 ? (
                <div className="flex items-center text-rose-500">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-[11px] font-black ml-0.5">{delta}</span>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground/60">
                  <Minus className="h-4 w-4" />
                  <span className="text-[11px] font-black ml-0.5">0</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="success" className="font-black uppercase tracking-widest text-[9px] px-2.5 py-0.5">
              Nivel {level}
            </Badge>
            {matchesPlayed > 0 && (
              <Badge variant="outline" className="border-primary/20 bg-primary/5 font-black uppercase tracking-widest text-[9px] px-2.5 py-0.5">
                {winRate}% WR
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
              Puntos
            </span>
            <span className="text-2xl font-black tabular-nums">{Math.round(score)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
              Récord
            </span>
            <span className="text-2xl font-black tabular-nums">
              {wins}W <span className="text-muted-foreground/30 font-normal">/</span> {losses}L
            </span>
          </div>
        </div>
      </div>

      {/* Decorative background icon */}
      <Trophy className="absolute -bottom-6 -right-6 h-40 w-40 rotate-12 text-primary/5 pointer-events-none" />
    </div>
  );
}

export function UserRankingCard({
  position,
  score,
  delta,
  level,
  className,
  wins = 0,
  losses = 0,
  matchesPlayed = 0,
}: Partial<UserRankingStatsProps>) {
  const winRate = calculateWinRate(wins, matchesPlayed);

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between overflow-hidden rounded-[2rem] border border-border/40 bg-card/60 p-6 shadow-lg backdrop-blur-md transition-all hover:bg-card/80 hover:border-primary/20 active:scale-[0.98]",
        className
      )}
    >
      <div className="flex items-center gap-5">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <Trophy className="h-7 w-7 transition-transform group-hover:scale-110" />
          <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground border-2 border-background shadow-sm">
            {level}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-0.5">
            Mi Estatus
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tighter">
              {position ? `#${position}` : "--"}
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-black leading-none tracking-tight">{Math.round(score ?? 1000)} pts</span>
              {matchesPlayed > 0 && (
                <span className="text-[11px] font-black uppercase tracking-[0.1em] text-primary/80 mt-0.5">{winRate}% WR</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 pr-1">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/50 border border-border/20 text-[11px] font-black uppercase">
          {delta && delta > 0 ? (
            <>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-500">+{delta}</span>
            </>
          ) : delta && delta < 0 ? (
            <>
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
              <span className="text-rose-500">{delta}</span>
            </>
          ) : (
            <>
              <Minus className="h-3.5 w-3.5 text-muted-foreground/40" />
              <span className="text-muted-foreground/40">0</span>
            </>
          )}
        </div>
        {matchesPlayed > 0 && (
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            {wins}V - {losses}D
          </span>
        )}
      </div>

      {/* Subtle background decoration */}
      <Activity className="absolute -right-4 -top-4 h-20 w-20 rotate-12 text-primary/5 transition-transform group-hover:rotate-[30deg] pointer-events-none" />
    </div>
  );
}
