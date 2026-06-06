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
  isCurrentUser?: boolean;
  onSlotClick: (team: TeamKey, index: 0 | 1) => void;
  onManageClick: (team: TeamKey, index: 0 | 1) => void;
}

export function SlotDisplay({
  team,
  index,
  slot,
  userDisplayName,
  isActive,
  isCurrentUser,
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
        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 active:scale-[0.98]",
        isActive
          ? "border-primary bg-primary/10 shadow-sm shadow-primary/5"
          : "border-border/40 bg-card/40 hover:bg-card/60"
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary shadow-inner">
        {slot?.kind === "user" && slot.player.image ? (
          <Image
            alt={slot.player.displayName}
            src={slot.player.image}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : slot?.kind === "user" ? (
          avatarFallback(slot.player.displayName)
        ) : (
          position + 1
        )}
      </div>
      <p className="flex-1 truncate text-sm font-semibold text-foreground">
        {displayName}
        {isCurrentUser && (
          <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary">
            Tú
          </span>
        )}
      </p>
      {isOwnerSlot ? null : (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
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
