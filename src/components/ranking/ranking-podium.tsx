import Link from "next/link";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { cn, capitalizeName, getMatchWinner } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Flame } from "lucide-react";

interface PodiumPlayer {
  id: string;
  displayName: string | null;
  alias: string | null;
  image: string | null;
  rankingScore: number;
  rankingDelta?: number | null;
  matchPlayers?: Array<{
    position: number;
    match: {
      score: string | null;
    };
  }>;
}

interface RankingPodiumProps {
  topThree: PodiumPlayer[];
  viewerId?: string | null;
}

function getPlayerStreak(player: PodiumPlayer): number {
  if (!player.matchPlayers || player.matchPlayers.length === 0) return 0;

  const recentForm = player.matchPlayers.map((mp) => {
    const winner = mp.match.score ? getMatchWinner(mp.match.score) : null;
    if (!winner) return "L";
    const playerTeam = mp.position < 2 ? "A" : "B";
    return winner === playerTeam ? "W" : "L";
  });

  let winStreak = 0;
  for (const res of recentForm) {
    if (res === "W") {
      winStreak++;
    } else {
      break;
    }
  }
  return winStreak;
}

export function RankingPodium({ topThree, viewerId }: RankingPodiumProps) {
  if (topThree.length === 0) return null;

  const second = topThree[1];
  const first = topThree[0];
  const third = topThree[2];

  const isFirstViewer = first && viewerId === first.id;
  const isSecondViewer = second && viewerId === second.id;
  const isThirdViewer = third && viewerId === third.id;

  const secondStreak = second ? getPlayerStreak(second) : 0;
  const firstStreak = first ? getPlayerStreak(first) : 0;
  const thirdStreak = third ? getPlayerStreak(third) : 0;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-foreground">Podio</h2>
      <div className="grid grid-cols-3 items-end gap-2">
        {/* 2nd Place */}
        {second && (
          <Link
            href={`/p/${second.id}?backUrl=/ranking`}
            aria-label={`2da posición: ${isSecondViewer ? "Vos" : capitalizeName(second.displayName ?? second.alias ?? "?")}, ${Math.round(second.rankingScore)} puntos. Cambio de posición: ${second.rankingDelta && second.rankingDelta > 0 ? `subió ${second.rankingDelta}` : second.rankingDelta && second.rankingDelta < 0 ? `bajó ${Math.abs(second.rankingDelta)}` : "sin cambios"}.`}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all active:scale-[0.98] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSecondViewer
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-card",
            )}
          >
            <div className="relative" aria-hidden="true">
              <PlayerAvatar
                name={capitalizeName(second.displayName ?? second.alias ?? "?")}
                image={second.image ?? undefined}
                size={48}
                className={cn("border-2", isSecondViewer ? "border-primary" : "border-muted")}
                aria-hidden="true"
              />
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground border-2 border-card">
                2
              </div>
            </div>
            <div className="flex flex-col items-center min-w-0 w-full animate-none" aria-hidden="true">
              <span className={cn("text-xs truncate w-full text-center flex items-center justify-center gap-0.5", isSecondViewer ? "text-primary font-bold" : "font-semibold text-foreground")}>
                <span className="truncate">{isSecondViewer ? "Vos" : capitalizeName(second.displayName ?? second.alias ?? "?")}</span>
                {secondStreak >= 2 && (
                  <span
                    className="inline-flex items-center gap-0.5 font-extrabold text-orange-500 shrink-0"
                    title={`Racha de ${secondStreak} victorias`}
                    aria-label={`Racha de ${secondStreak} victorias`}
                  >
                    <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" aria-hidden="true" />
                    <span className="text-[11px] leading-none">{secondStreak}</span>
                  </span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(second.rankingScore)} pts
              </span>
              {second.rankingDelta !== undefined && second.rankingDelta !== null && second.rankingDelta !== 0 ? (
                <div className="flex items-center gap-0.5 text-[10px] font-bold mt-0.5">
                  {second.rankingDelta > 0 ? (
                    <div className="flex items-center gap-0.5 text-primary" title={`Subió ${second.rankingDelta} posiciones`}>
                      <TrendingUp className="h-2.5 w-2.5" />
                      <span>+{second.rankingDelta}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5 text-muted-foreground" title={`Bajó ${Math.abs(second.rankingDelta)} posiciones`}>
                      <TrendingDown className="h-2.5 w-2.5" />
                      <span>{second.rankingDelta}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground/40 mt-0.5">
                  <Minus className="h-2.5 w-2.5" />
                  <span>0</span>
                </div>
              )}
            </div>
          </Link>
        )}

        {/* 1st Place */}
        {first && (
          <Link
            href={`/p/${first.id}?backUrl=/ranking`}
            aria-label={`1ra posición: ${isFirstViewer ? "Vos" : capitalizeName(first.displayName ?? first.alias ?? "?")}, ${Math.round(first.rankingScore)} puntos. Cambio de posición: ${first.rankingDelta && first.rankingDelta > 0 ? `subió ${first.rankingDelta}` : first.rankingDelta && first.rankingDelta < 0 ? `bajó ${Math.abs(first.rankingDelta)}` : "sin cambios"}.`}
            className="flex flex-col items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 transition-all active:scale-[0.98] hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="relative" aria-hidden="true">
              <PlayerAvatar
                name={capitalizeName(first.displayName ?? first.alias ?? "?")}
                image={first.image ?? undefined}
                size={56}
                className="border-2 border-primary"
                aria-hidden="true"
              />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground border-2 border-background">
                1
              </div>
            </div>
            <div className="flex flex-col items-center min-w-0 w-full animate-none" aria-hidden="true">
              <span className={cn("text-xs font-bold truncate w-full text-center flex items-center justify-center gap-0.5", isFirstViewer ? "text-primary" : "text-foreground")}>
                <span className="truncate">{isFirstViewer ? "Vos" : capitalizeName(first.displayName ?? first.alias ?? "?")}</span>
                {firstStreak >= 2 && (
                  <span
                    className="inline-flex items-center gap-0.5 font-extrabold text-orange-500 shrink-0"
                    title={`Racha de ${firstStreak} victorias`}
                    aria-label={`Racha de ${firstStreak} victorias`}
                  >
                    <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" aria-hidden="true" />
                    <span className="text-[11px] leading-none">{firstStreak}</span>
                  </span>
                )}
              </span>
              <span className="text-xs font-bold text-primary">
                {Math.round(first.rankingScore)} pts
              </span>
              {first.rankingDelta !== undefined && first.rankingDelta !== null && first.rankingDelta !== 0 ? (
                <div className="flex items-center gap-0.5 text-[10px] font-bold mt-0.5">
                  {first.rankingDelta > 0 ? (
                    <div className="flex items-center gap-0.5 text-primary" title={`Subió ${first.rankingDelta} posiciones`}>
                      <TrendingUp className="h-2.5 w-2.5" />
                      <span>+{first.rankingDelta}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5 text-muted-foreground" title={`Bajó ${Math.abs(first.rankingDelta)} posiciones`}>
                      <TrendingDown className="h-2.5 w-2.5" />
                      <span>{first.rankingDelta}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground/40 mt-0.5">
                  <Minus className="h-2.5 w-2.5" />
                  <span>0</span>
                </div>
              )}
            </div>
          </Link>
        )}

        {/* 3rd Place */}
        {third && (
          <Link
            href={`/p/${third.id}?backUrl=/ranking`}
            aria-label={`3ra posición: ${isThirdViewer ? "Vos" : capitalizeName(third.displayName ?? third.alias ?? "?")}, ${Math.round(third.rankingScore)} puntos. Cambio de posición: ${third.rankingDelta && third.rankingDelta > 0 ? `subió ${third.rankingDelta}` : third.rankingDelta && third.rankingDelta < 0 ? `bajó ${Math.abs(third.rankingDelta)}` : "sin cambios"}.`}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all active:scale-[0.98] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isThirdViewer
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-card",
            )}
          >
            <div className="relative" aria-hidden="true">
              <PlayerAvatar
                name={capitalizeName(third.displayName ?? third.alias ?? "?")}
                image={third.image ?? undefined}
                size={44}
                className={cn("border-2", isThirdViewer ? "border-primary" : "border-muted")}
                aria-hidden="true"
              />
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground border-2 border-card">
                3
              </div>
            </div>
            <div className="flex flex-col items-center min-w-0 w-full animate-none" aria-hidden="true">
              <span className={cn("text-xs truncate w-full text-center flex items-center justify-center gap-0.5", isThirdViewer ? "text-primary font-bold" : "font-semibold text-foreground")}>
                <span className="truncate">{isThirdViewer ? "Vos" : capitalizeName(third.displayName ?? third.alias ?? "?")}</span>
                {thirdStreak >= 2 && (
                  <span
                    className="inline-flex items-center gap-0.5 font-extrabold text-orange-500 shrink-0"
                    title={`Racha de ${thirdStreak} victorias`}
                    aria-label={`Racha de ${thirdStreak} victorias`}
                  >
                    <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" aria-hidden="true" />
                    <span className="text-[11px] leading-none">{thirdStreak}</span>
                  </span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(third.rankingScore)} pts
              </span>
              {third.rankingDelta !== undefined && third.rankingDelta !== null && third.rankingDelta !== 0 ? (
                <div className="flex items-center gap-0.5 text-[10px] font-bold mt-0.5">
                  {third.rankingDelta > 0 ? (
                    <div className="flex items-center gap-0.5 text-primary" title={`Subió ${third.rankingDelta} posiciones`}>
                      <TrendingUp className="h-2.5 w-2.5" />
                      <span>+{third.rankingDelta}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5 text-muted-foreground" title={`Bajó ${Math.abs(third.rankingDelta)} posiciones`}>
                      <TrendingDown className="h-2.5 w-2.5" />
                      <span>{third.rankingDelta}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground/40 mt-0.5">
                  <Minus className="h-2.5 w-2.5" />
                  <span>0</span>
                </div>
              )}
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
