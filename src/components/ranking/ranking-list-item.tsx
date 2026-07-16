import Link from "next/link";
import { ShieldCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
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

export function RankingListItem({
  player,
  index,
  viewerId,
}: RankingListItemProps) {
  const isViewer = player.id === viewerId;
  const recentForm = player.matchPlayers.map((mp) => {
    const winner = mp.match.score ? getMatchWinner(mp.match.score) : null;
    if (!winner) return "L";
    const playerTeam = mp.position < 2 ? "A" : "B";
    return winner === playerTeam ? "W" : "L";
  });

  const displayName = player.alias ?? player.displayName ?? "Jugador";

  return (
    <Link
      href={`/p/${player.id}`}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isViewer ? "border-primary/30 bg-primary/5" : "border-border bg-card",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums",
          isViewer
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {player.rankingPosition ?? index + 1}
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <PlayerAvatar
          name={displayName}
          image={player.image ?? undefined}
          size={36}
          className="rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p
              className={cn(
                "text-sm font-bold truncate",
                isViewer ? "text-primary" : "text-foreground",
              )}
            >
              {displayName}
            </p>
            {player.attendanceScore >= 0.9 && (
              <ShieldCheck
                className="h-3 w-3 text-primary"
                aria-label="Jugador confiable"
              />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              Nivel {player.level}
            </span>
            <span className="text-xs text-muted-foreground/80">
              {player.wins}V-{player.losses}D
            </span>
            {recentForm.length > 0 && (
              <div
                className="flex gap-0.5"
                aria-label={`Forma reciente: ${recentForm
                  .map((r) => (r === "W" ? "G" : "P"))
                  .join(", ")}`}
              >
                {recentForm.map((result, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      result === "W" ? "bg-emerald-500" : "bg-rose-500",
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <span
          className="text-sm font-bold text-foreground"
          aria-label={`${Math.round(player.rankingScore)} puntos`}
        >
          {Math.round(player.rankingScore)}
        </span>
        <div className="flex items-center gap-0.5">
          {player.rankingDelta > 0 ? (
            <div
              className="flex items-center gap-0.5 text-xs text-primary"
              aria-label={`Subió ${player.rankingDelta} puntos`}
            >
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
              <span>+{player.rankingDelta}</span>
            </div>
          ) : player.rankingDelta < 0 ? (
            <div
              className="flex items-center gap-0.5 text-xs text-muted-foreground"
              aria-label={`Bajó ${Math.abs(player.rankingDelta)} puntos`}
            >
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
              <span>{player.rankingDelta}</span>
            </div>
          ) : (
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground/50">
              <Minus className="h-3 w-3" />
              <span>0</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
