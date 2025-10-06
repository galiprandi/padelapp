import { Fragment } from "react";

import { UserCheck, UserPlus } from "lucide-react";

import { PlayerAvatar } from "@/components/players/player-avatar";
import { Button } from "@/components/ui/button";

export interface PlayerPreviewProps {
  id: string;
  name: string;
  role?: string;
  image?: string;
  isConfirmed?: boolean;
  ranking?: number;
  category?: number;
}

export function PlayerPreview({ name, role, image, isConfirmed, category }: PlayerPreviewProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2"
    >
      <PlayerAvatar name={name} image={image} />

      <div className="flex-1 truncate">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        {role ? (
          <p className="truncate text-xs text-muted-foreground">
            {role}
            {typeof category === "number" ? ` · Categoría ${category}` : null}
          </p>
        ) : null}
      </div>

      <Button type="button" variant="ghost" size="icon" aria-label={isConfirmed ? "Gestionar jugador" : "Invitar jugador"}>
        {isConfirmed ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      </Button>
    </div>
  );
}

export function PlayerWithRanking({ name, role, image, ranking, category }: PlayerPreviewProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2"
    >
      <PlayerAvatar name={name} image={image} />

      <div className="flex-1 truncate">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        {role ? (
          <p className="truncate text-xs text-muted-foreground">
            {role}
            {typeof category === "number" ? ` · Categoría ${category}` : null}
          </p>
        ) : null}
      </div>

      {typeof ranking === "number" ? (
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">#{ranking}</span>
      ) : null}
    </div>
  );
}

export function PlayerCompact({ name, image, ranking }: PlayerPreviewProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2"
    >
      <PlayerAvatar name={name} image={image} />

      <p className="flex-1 truncate text-sm font-semibold text-foreground">{name}</p>

      {typeof ranking === "number" ? (
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">#{ranking}</span>
      ) : null}
    </div>
  );
}

export function PairPreview({ players, label }: { players: PlayerPreviewProps[]; label: string }) {
  const hasConnector = players.length > 1;

  return (
    <div className="relative rounded-xl border border-border/80 bg-muted/30 mt-6">
      <span className="absolute left-4 top-0 -translate-y-1/2 rounded-full bg-background px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="relative space-y-3 p-4 pt-2">
        {hasConnector ? (
          <div
            className="pointer-events-none absolute left-1 top-1 bottom-1 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent"
            aria-hidden
          />
        ) : null}
        {players.map((player) => (
          <div key={`pair-${label}-${player.id}`} className="relative">
            {hasConnector ? (
              <span
                className="pointer-events-none absolute left-[-28px] top-1/2 h-px w-7 -translate-y-1/2 bg-gradient-to-r from-primary/30 via-primary/40 to-transparent"
                aria-hidden
              />
            ) : null}
            <PlayerPreview {...player} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PairInline({ players, label }: { players: PlayerPreviewProps[]; label: string }) {
  return (
    <div className="relative rounded-xl border border-border/80 bg-muted/30">
      <span className="absolute left-4 top-0 -translate-y-1/2 rounded-full bg-background px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>

      <div className="flex items-center gap-4 pr-5 pb-4 pt-6 pl-7">
        {players.map((player, index) => {
          return (
            <Fragment key={`pair-inline-${label}-${player.id}`}>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <PlayerAvatar name={player.name} image={player.image} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{player.name}</p>
                  {typeof player.category === "number" ? (
                    <p className="truncate text-xs text-muted-foreground">Categoría {player.category}</p>
                  ) : null}
                </div>
              </div>
              {index < players.length - 1 ? <span className="h-10 w-px bg-border" aria-hidden /> : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
