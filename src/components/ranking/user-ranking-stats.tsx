import { TrendingUp, TrendingDown, Minus, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface UserRankingStatsProps {
  position: number | null;
  score: number;
  delta: number;
  wins: number;
  losses: number;
  level: number;
  className?: string;
}

export function UserRankingBanner({
  position,
  score,
  delta,
  wins,
  losses,
  level,
  className,
}: UserRankingStatsProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
            Tu Ranking Actual
          </span>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-foreground">
              {position ? `#${position}` : "S/P"}
            </h2>
            <div className="flex items-center gap-1">
              {delta > 0 ? (
                <div className="flex items-center text-green-500">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-black">+{delta}</span>
                </div>
              ) : delta < 0 ? (
                <div className="flex items-center text-red-500">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-black">{delta}</span>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <Minus className="h-4 w-4" />
                  <span className="text-sm font-black">0</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant="success" className="mt-1 font-black uppercase tracking-tight">
            Nivel {level}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Puntos
            </span>
            <span className="text-xl font-black">{Math.round(score)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Récord (V-D)
            </span>
            <span className="text-xl font-black">
              {wins} - {losses}
            </span>
          </div>
        </div>
      </div>

      {/* Decorative background icon */}
      <Trophy className="absolute -bottom-4 -right-4 h-32 w-32 rotate-12 text-primary/5" />
    </div>
  );
}

export function UserRankingCard({
  position,
  score,
  delta,
  level,
  className,
}: Omit<UserRankingStatsProps, "wins" | "losses">) {
  return (
    <div
      className={cn(
        "group relative flex items-center justify-between overflow-hidden rounded-2xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:border-primary/30 active:scale-[0.98]",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Mi Posición
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black">
              {position ? `#${position}` : "--"}
            </span>
            <span className="text-xs font-black text-muted-foreground">
              {Math.round(score)} pts
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <Badge variant="outline" className="border-primary/20 text-[10px] font-black text-primary/80">
          Nivel {level}
        </Badge>
        <div className="flex items-center gap-1">
          {delta > 0 ? (
            <>
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-[10px] font-black text-green-500">+{delta}</span>
            </>
          ) : delta < 0 ? (
            <>
              <TrendingDown className="h-3 w-3 text-red-500" />
              <span className="text-[10px] font-black text-red-500">{delta}</span>
            </>
          ) : (
            <>
              <Minus className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-black text-muted-foreground">0</span>
            </>
          )}
        </div>
      </div>

      {/* Subtle background decoration */}
      <Target className="absolute -right-2 -top-2 h-16 w-16 rotate-12 opacity-[0.03] transition-transform group-hover:rotate-45" />
    </div>
  );
}
