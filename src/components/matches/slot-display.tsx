"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UsersRound, CheckCircle2 } from "lucide-react";
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
        "group relative flex items-center gap-4 rounded-[2rem] border px-6 py-5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 active:scale-[0.98] backdrop-blur-md overflow-hidden",
        isActive
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-[1.02] z-10"
          : isUser
            ? "border-primary/20 bg-primary/5 shadow-sm"
            : "border-border/40 bg-card/40 hover:bg-card/60 shadow-sm"
      )}
    >
      {/* Background decoration for active or user slots */}
      {(isActive || isUser) && (
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
      )}

      <div className={cn(
        "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-sm font-black shadow-inner transition-all duration-500",
        isActive ? "bg-primary text-primary-foreground scale-105 shadow-lg shadow-primary/20 ring-4 ring-background" :
        isUser ? "bg-primary/20 text-primary" : "text-muted-foreground/50"
      )}>
        {slot?.kind === "user" && slot.player.image ? (
          <Image
            alt={slot.player.displayName}
            src={slot.player.image}
            width={56}
            height={56}
            className="h-14 w-14 rounded-2xl object-cover"
          />
        ) : slot?.kind === "user" ? (
          <span className="text-lg">{avatarFallback(slot.player.displayName)}</span>
        ) : (
          <span className="text-lg">{position + 1}</span>
        )}

        {isUser && !isActive && (
          <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-background shadow-md animate-in zoom-in duration-300">
            <CheckCircle2 className="h-2.5 w-2.5 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {isUser && (
          <span className={cn(
            "text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1.5 transition-colors",
            isActive ? "text-primary-foreground/60" : "text-primary/60"
          )}>
            Perfil Verificado
          </span>
        )}
        <p className={cn(
          "truncate text-base font-black leading-tight transition-colors",
          isActive ? "text-foreground" : isUser ? "text-foreground" : "text-foreground/80"
        )}>
          {displayName}
        </p>
        {!isUser && (
          <span className="text-[10px] font-medium text-muted-foreground/40 mt-1 uppercase tracking-wider">Cupo pendiente</span>
        )}
      </div>

      {isOwnerSlot ? (
        <div className="flex h-10 items-center px-3 rounded-xl bg-primary/10 border border-primary/20">
           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Tú</span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-2xl transition-all active:scale-90",
              isActive ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-muted-foreground/40 hover:bg-muted"
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
