import { Fragment } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PlayerPreviewProps {
  id: string;
  name: string;
  role?: string;
  image?: string;
  isConfirmed?: boolean;
  ranking?: number;
  category?: number;
  onManageClick?: () => void;
  manageAriaLabel?: string;
}

export function PlayerPreview({
  name,
  role,
  image,
  isConfirmed,
  category,
  onManageClick,
  manageAriaLabel
}: PlayerPreviewProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <PlayerAvatar name={name} image={image} className="rounded-lg" />

      <div className="flex-1 truncate">
        <p className="truncate text-sm font-bold text-foreground">{name}</p>
        {role || category ? (
          <p className="truncate text-xs font-medium text-muted-foreground mt-0.5">
            {role}
            {role && typeof category === "number" ? " · " : ""}
            {typeof category === "number" ? `Cat. ${category}` : ""}
          </p>
        ) : null}
      </div>

      {onManageClick ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
          aria-label={
            manageAriaLabel ||
            (isConfirmed ? "Gestionar jugador" : "Invitar jugador")
          }
          onClick={(event) => {
            event.stopPropagation();
            onManageClick();
          }}
        >
          {isConfirmed ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
        </Button>
      ) : null}
    </div>
  );
}

export function PlayerWithRanking({ name, role, image, ranking, category }: PlayerPreviewProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <PlayerAvatar name={name} image={image} className="rounded-lg" />

      <div className="flex-1 truncate">
        <p className="truncate text-sm font-bold text-foreground">{name}</p>
        {role || category ? (
          <p className="truncate text-xs font-medium text-muted-foreground mt-0.5">
            {role}
            {role && typeof category === "number" ? " · " : ""}
            {typeof category === "number" ? `Cat. ${category}` : ""}
          </p>
        ) : null}
      </div>

      {typeof ranking === "number" ? (
        <span className="flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-primary/10 px-2 text-xs font-bold text-primary border border-primary/20">
          #{ranking}
        </span>
      ) : null}
    </div>
  );
}

export function PlayerCompact({ name, image, ranking }: PlayerPreviewProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <PlayerAvatar name={name} image={image} size={32} className="rounded-lg" />

      <p className="flex-1 truncate text-sm font-bold text-foreground">{name}</p>

      {typeof ranking === "number" ? (
        <span className="flex h-7 min-w-[28px] items-center justify-center rounded-md bg-secondary/50 px-1.5 text-xs font-bold text-secondary-foreground border border-secondary/20">
          #{ranking}
        </span>
      ) : null}
    </div>
  );
}

export function PairPreview({ players, label }: { players: PlayerPreviewProps[]; label: string }) {
  const hasConnector = players.length > 1;

  return (
    <div className="relative rounded-xl border border-border bg-card mt-8 shadow-sm">
      <span className="absolute left-6 top-0 -translate-y-1/2 rounded-full bg-background border border-border px-3 py-0.5 text-xs font-bold text-muted-foreground shadow-sm z-10">
        {label}
      </span>
      <div className="relative space-y-3 p-5 pt-6">
        {hasConnector ? (
          <div
            className="pointer-events-none absolute left-2 top-8 bottom-8 w-px bg-border"
            aria-hidden
          />
        ) : null}
        {players.map((player) => (
          <div key={`pair-${label}-${player.id}`} className="relative">
            {hasConnector ? (
              <span
                className="pointer-events-none absolute left-[-20px] top-1/2 h-px w-5 -translate-y-1/2 bg-border"
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
    <div className="relative rounded-xl border border-border bg-card shadow-sm">
      <span className="absolute left-6 top-0 -translate-y-1/2 rounded-full bg-background border border-border px-3 py-0.5 text-xs font-bold text-muted-foreground shadow-sm z-10">
        {label}
      </span>

      <div className="flex items-center gap-4 px-6 py-6 pt-7">
        {players.map((player, index) => {
          return (
            <Fragment key={`pair-inline-${label}-${player.id}`}>
              <div className="flex min-w-0 flex-1 items-center gap-3 group transition-colors">
                <PlayerAvatar name={player.name} image={player.image} className="rounded-lg border border-border/20 shadow-sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{player.name}</p>
                  {typeof player.category === "number" ? (
                    <p className="truncate text-xs font-medium text-muted-foreground mt-0.5">Cat. {player.category}</p>
                  ) : null}
                </div>
              </div>
              {index < players.length - 1 ? (
                <div className="h-8 w-px bg-border/20" aria-hidden />
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
