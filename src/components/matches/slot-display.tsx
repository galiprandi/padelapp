"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UsersRound } from "lucide-react";
import { avatarFallback, positionFromTeam } from "@/lib/match-utils";
import type { SlotValue, TeamKey } from "@/lib/match-types";
import { cn } from "@/lib/utils";

interface SlotDisplayProps {
  team: TeamKey;
  index: 0 | 1;
  slot: SlotValue | null;
  userDisplayName: string;
  isActive: boolean;
  onSlotClick: (team: TeamKey, index: 0 | 1) => void;
  onManageClick: (team: TeamKey, index: 0 | 1) => void;
}

export function SlotDisplay({
  team,
  index,
  slot,
  userDisplayName,
  isActive,
  onSlotClick,
  onManageClick,
}: SlotDisplayProps) {
  const position = positionFromTeam(team, index);
  const placeholderName = `Jugador ${position + 1}`;

  const displayName =
    slot?.kind === "user"
      ? slot.player.displayName
      : slot?.kind === "placeholder"
        ? slot.displayName
        : team === "A" && index === 0
          ? userDisplayName
          : placeholderName;
  const isOwnerSlot = team === "A" && index === 0;
  const isUser = slot?.kind === "user";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSlotClick(team, index)}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          onSlotClick(team, index);
        }
      }}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2",
        isActive
          ? "border-primary bg-primary/5"
          : isUser
            ? "border-primary/20 bg-primary/5"
            : "border-border bg-card hover:bg-muted/50",
      )}
    >
      <div
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : isUser
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground",
        )}
      >
        {slot?.kind === "user" && slot.player.image ? (
          <Image
            alt={slot.player.displayName}
            src={slot.player.image}
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : slot?.kind === "user" ? (
          <span className="text-sm">
            {avatarFallback(slot.player.displayName)}
          </span>
        ) : (
          <span className="text-sm">{position + 1}</span>
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <p
          className={cn(
            "truncate text-sm font-semibold leading-tight",
            isActive || isUser ? "text-foreground" : "text-foreground/80",
          )}
        >
          {displayName}
        </p>
        {!isUser && (
          <span className="text-xs text-muted-foreground mt-0.5">
            Cupo pendiente
          </span>
        )}
      </div>

      {isOwnerSlot ? (
        <div className="flex h-8 items-center px-2.5 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-xs font-semibold text-primary">Tú</span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-lg transition-colors",
              isActive
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:bg-muted",
            )}
            aria-label={
              slot?.kind === "placeholder"
                ? "Gestionar nombre del cupo"
                : slot?.kind === "user"
                  ? "Cambiar jugador"
                  : "Asignar jugador"
            }
            onClick={(event) => {
              event.stopPropagation();
              onManageClick(team, index);
            }}
          >
            <UsersRound className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
