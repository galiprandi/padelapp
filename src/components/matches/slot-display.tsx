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
        "flex items-center gap-4 rounded-[2rem] border px-5 py-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 active:scale-[0.98] backdrop-blur-md",
        isActive
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
          : "border-border/40 bg-card/40 hover:bg-card/60 shadow-sm"
      )}
    >
      <div className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-sm font-black shadow-inner transition-all duration-500",
        isActive ? "bg-primary/20 text-primary scale-105" : "text-muted-foreground/50"
      )}>
        {slot?.kind === "user" && slot.player.image ? (
          <Image
            alt={slot.player.displayName}
            src={slot.player.image}
            width={48}
            height={48}
            className="h-12 w-12 rounded-2xl object-cover"
          />
        ) : slot?.kind === "user" ? (
          <span className="text-base">{avatarFallback(slot.player.displayName)}</span>
        ) : (
          <span className="text-base">{position + 1}</span>
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        {slot?.kind === "user" && (
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 leading-none mb-1">Inscripto</span>
        )}
        <p className={cn(
          "truncate text-base font-black leading-tight transition-colors",
          isActive ? "text-foreground" : "text-foreground/80"
        )}>
          {displayName}
        </p>
      </div>
      {isOwnerSlot ? null : (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl transition-all active:scale-90",
              isActive ? "text-primary hover:bg-primary/10" : "text-muted-foreground/40 hover:bg-muted"
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
            <UsersRound className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
