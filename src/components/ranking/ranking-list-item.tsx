import Link from "next/link";
import { ShieldCheck, TrendingUp, TrendingDown, Minus, Flame } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { cn, capitalizeName } from "@/lib/utils";
import { getPlayerRecentForm, calculatePlayerStreak } from "@/lib/match-helpers";

interface RankingListItemProps {
  player: {
    id: string;
    displayName: string | null;
    alias: string | null;
    image: string | null;
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
  customPosition?: number;
}

export function RankingListItem({
  player,
  index,
  viewerId,
  customPosition,
}: RankingListItemProps) {
  const isViewer = player.id === viewerId;
  const recentForm = getPlayerRecentForm(player.matchPlayers);
  const winStreak = calculatePlayerStreak(player.matchPlayers);

  const displayName = capitalizeName(player.displayName ?? player.alias ?? "Jugador");
  const positionNum = customPosition ?? player.rankingPosition ?? index + 1;

  const deltaText =
    player.rankingDelta > 0
      ? `subió ${player.rankingDelta}`
      : player.rankingDelta < 0
      ? `bajó ${Math.abs(player.rankingDelta)}`
      : "sin cambios";

  const ariaLabel = `Posición ${positionNum}: ${isViewer ? "Vos" : displayName}, ${Math.round(player.rankingScore)} puntos. ${player.wins} victorias, ${player.losses} derrotas. Cambio de posición: ${deltaText}.`;

  return (
    <Link
      href={`/p/${player.id}?backUrl=/ranking`}
      prefetch={true}
      aria-label={ariaLabel}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all active:scale-[0.98] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        isViewer ? "border-primary font-semibold shadow-sm bg-card" : "border-border bg-card",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums",
          isViewer
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {positionNum}
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0" aria-hidden="true">
        <PlayerAvatar
          name={displayName}
          image={player.image ?? undefined}
          size={36}
          className="rounded-lg"
          aria-hidden="true"
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
            {winStreak >= 2 && (
              <div
                className="flex items-center gap-0.5 text-xs font-extrabold text-orange-500"
                title={`Racha de ${winStreak} victorias`}
              >
                <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" aria-hidden="true" />
                <span>{winStreak}</span>
              </div>
            )}
            {player.attendanceScore >= 0.9 && (
              <span title="Jugador confiable">
                <ShieldCheck className="h-3 w-3 text-primary" aria-hidden="true" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground/80">
              {player.wins}V-{player.losses}D
            </span>
            {recentForm.length > 0 && (
              <div
                className="flex gap-0.5"
                title={`Forma reciente: ${recentForm
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

      <div className="flex flex-col items-end gap-0.5" aria-hidden="true">
        <span className="text-sm font-bold text-foreground">
          {Math.round(player.rankingScore)}
        </span>
        <div className="flex items-center gap-0.5">
          {player.rankingDelta > 0 ? (
            <div className="flex items-center gap-0.5 text-xs text-primary">
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
              <span>+{player.rankingDelta}</span>
            </div>
          ) : player.rankingDelta < 0 ? (
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
              <span>{player.rankingDelta}</span>
            </div>
          ) : (
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground/50">
              <Minus className="h-3 w-3" aria-hidden="true" />
              <span>0</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
