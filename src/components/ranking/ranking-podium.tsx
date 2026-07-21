import Link from "next/link";
import { PlayerAvatar } from "@/components/players/player-avatar";

interface PodiumPlayer {
  id: string;
  displayName: string | null;
  alias: string | null;
  image: string | null;
  rankingScore: number;
}

interface RankingPodiumProps {
  topThree: PodiumPlayer[];
}

export function RankingPodium({ topThree }: RankingPodiumProps) {
  if (topThree.length === 0) return null;

  const second = topThree[1];
  const first = topThree[0];
  const third = topThree[2];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-foreground">Podio</h2>
      <div className="grid grid-cols-3 items-end gap-2">
        {/* 2nd Place */}
        {second && (
          <Link
            href={`/p/${second.id}?backUrl=/ranking`}
            aria-label={`2da posición: ${second.alias ?? second.displayName}, ${Math.round(second.rankingScore)} puntos`}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="relative" aria-hidden="true">
              <PlayerAvatar
                name={second.alias ?? second.displayName ?? "Player"}
                image={second.image ?? undefined}
                size={48}
                className="border-2 border-muted"
                aria-hidden="true"
              />
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground border-2 border-card">
                2
              </div>
            </div>
            <div className="flex flex-col items-center min-w-0 w-full" aria-hidden="true">
              <span className="text-xs font-semibold text-foreground truncate w-full text-center">
                {second.alias ?? second.displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(second.rankingScore)} pts
              </span>
            </div>
          </Link>
        )}

        {/* 1st Place */}
        {first && (
          <Link
            href={`/p/${first.id}?backUrl=/ranking`}
            aria-label={`1ra posición: ${first.alias ?? first.displayName}, ${Math.round(first.rankingScore)} puntos`}
            className="flex flex-col items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="relative" aria-hidden="true">
              <PlayerAvatar
                name={first.alias ?? first.displayName ?? "Player"}
                image={first.image ?? undefined}
                size={56}
                className="border-2 border-primary"
                aria-hidden="true"
              />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground border-2 border-background">
                1
              </div>
            </div>
            <div className="flex flex-col items-center min-w-0 w-full" aria-hidden="true">
              <span className="text-xs font-bold text-foreground truncate w-full text-center">
                {first.alias ?? first.displayName}
              </span>
              <span className="text-xs font-bold text-primary">
                {Math.round(first.rankingScore)} pts
              </span>
            </div>
          </Link>
        )}

        {/* 3rd Place */}
        {third && (
          <Link
            href={`/p/${third.id}?backUrl=/ranking`}
            aria-label={`3ra posición: ${third.alias ?? third.displayName}, ${Math.round(third.rankingScore)} puntos`}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="relative" aria-hidden="true">
              <PlayerAvatar
                name={third.alias ?? third.displayName ?? "Player"}
                image={third.image ?? undefined}
                size={44}
                className="border-2 border-muted"
                aria-hidden="true"
              />
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground border-2 border-card">
                3
              </div>
            </div>
            <div className="flex flex-col items-center min-w-0 w-full" aria-hidden="true">
              <span className="text-xs font-semibold text-foreground truncate w-full text-center">
                {third.alias ?? third.displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(third.rankingScore)} pts
              </span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
