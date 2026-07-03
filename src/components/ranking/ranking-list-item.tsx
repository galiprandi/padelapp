import Link from "next/link";
import { ShieldCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { Badge } from "@/components/ui/badge";
import { cn, getMatchWinner } from "@/lib/utils";

interface RankingListItemProps {
  player: {
    id: string;
    displayName: string | null;
    alias: string | null;
    image: string | null;
    level: number;
    rankingScore: number;
    rankingPosition: number | null;
    rankingDelta: number;
    wins: number;
    losses: number;
    attendanceScore: number;
    matchPlayers: Array<{
      position: number;
      match: {
        score: string | null;
      };
    }>;
  };
  index: number;
  viewerId?: string | null;
}

export function RankingListItem({ player, index, viewerId }: RankingListItemProps) {
  const isViewer = player.id === viewerId;
  const recentForm = player.matchPlayers.map(mp => {
    const winner = mp.match.score ? getMatchWinner(mp.match.score) : null;
    if (!winner) return 'L';
    const playerTeam = mp.position < 2 ? 'A' : 'B';
    return winner === playerTeam ? 'W' : 'L';
  });

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-[2rem] border p-4 shadow-sm transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-1000",
        isViewer
          ? "border-primary/50 bg-primary/10 backdrop-blur-md ring-1 ring-primary/20"
          : "border-border/40 bg-card/50 backdrop-blur-md hover:bg-card/80"
      )}
      style={{ animationDelay: `${500 + (index * 50)}ms` }}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black text-lg shadow-inner",
          isViewer
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : index === 0 ? "bg-yellow-400/20 text-yellow-600 border border-yellow-400/30"
            : index === 1 ? "bg-slate-300/30 text-slate-600 border border-slate-300/40"
            : index === 2 ? "bg-amber-600/20 text-amber-700 border border-amber-600/30"
            : "bg-muted text-muted-foreground"
        )}
      >
        {player.rankingPosition ?? index + 1}
      </div>

      <Link
        href={`/p/${player.id}`}
        className="flex items-center gap-3 flex-1 min-w-0 group/player"
      >
        <PlayerAvatar
          name={player.alias ?? player.displayName ?? "Player"}
          image={player.image ?? undefined}
          size={40}
          className="rounded-xl transition-transform group-hover/player:scale-110"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              "font-black truncate text-sm tracking-tight group-hover/player:text-primary transition-colors",
              isViewer ? "text-primary-foreground group-hover/player:text-primary-foreground" : "text-foreground"
            )}>
              {player.alias ?? player.displayName}
            </p>
            {player.attendanceScore >= 0.9 && (
              <ShieldCheck className={cn(
                "h-3 w-3",
                isViewer ? "text-primary-foreground/60" : "text-emerald-500/60"
              )} />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge
              variant="outline"
              className={cn(
                "h-4 px-2 text-[8px] font-black uppercase",
                isViewer
                  ? "border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10"
                  : "border-primary/30 text-primary bg-primary/5"
              )}
            >
              Nivel {player.level}
            </Badge>
            <span className={cn(
              "text-[11px] font-black uppercase tracking-[0.2em]",
              isViewer ? "text-primary-foreground/60" : "text-muted-foreground/50"
            )}>
              {player.wins}V - {player.losses}D
            </span>

            {recentForm.length > 0 && (
              <div className="flex gap-1 ml-1 items-center">
                <span className="text-[10px] text-muted-foreground/30 mr-1">•</span>
                {recentForm.map((result, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      result === "W" ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" : "bg-rose-500/40"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-col items-end gap-1 pr-1">
        <span className={cn(
          "text-base font-black tracking-tighter",
          isViewer ? "text-primary-foreground" : "text-foreground"
        )}>
          {Math.round(player.rankingScore)}
          <span className={cn(
            "ml-1 text-[11px] font-black uppercase tracking-[0.2em]",
            isViewer ? "text-primary-foreground/60" : "text-muted-foreground/60"
          )}>pts</span>
        </span>
        <div className="flex items-center gap-1.5">
          {player.rankingDelta > 0 ? (
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-full border",
              isViewer
                ? "bg-green-400/20 border-green-400/30 text-green-400"
                : "bg-green-500/10 border border-green-500/20 text-green-500"
            )}>
              <TrendingUp className="h-3 w-3" />
              <span className="text-[9px] font-black">+{player.rankingDelta}</span>
            </div>
          ) : player.rankingDelta < 0 ? (
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-full border",
              isViewer
                ? "bg-red-400/20 border-red-400/30 text-red-400"
                : "bg-red-500/10 border border-red-500/20 text-red-500"
            )}>
              <TrendingDown className="h-3 w-3" />
              <span className="text-[9px] font-black">{player.rankingDelta}</span>
            </div>
          ) : (
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-border/20",
              isViewer ? "bg-white/10" : "bg-muted/20"
            )}>
              <Minus className={cn(
                "h-3 w-3",
                isViewer ? "text-primary-foreground/40" : "text-muted-foreground/40"
              )} />
              <span className={cn(
                "text-[9px] font-black",
                isViewer ? "text-primary-foreground/40" : "text-muted-foreground/40"
              )}>0</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
