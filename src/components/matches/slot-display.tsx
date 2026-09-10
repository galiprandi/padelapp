"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UsersRound } from "lucide-react";
import { avatarFallback, positionFromTeam } from "@/lib/match-utils";
import type { SlotValue, TeamKey } from "@/lib/match-types";
import { cn } from "@/lib/utils";
import {
  getSlotDisplayName,
  getSlotAriaLabel,
  getManageButtonAriaLabel,
} from "./slot-display-utils";

interface SlotDisplayProps {
  team: TeamKey;
  index: 0 | 1;
  slot: SlotValue | null;
  userDisplayName: string;
  currentUserId?: string;
  isActive: boolean;
  onSlotClick: (team: TeamKey, index: 0 | 1) => void;
  onManageClick: (team: TeamKey, index: 0 | 1) => void;
}

export function SlotDisplay({
  team,
  index,
  slot,
  userDisplayName,
  currentUserId,
  isActive,
  onSlotClick,
  onManageClick,
}: SlotDisplayProps) {
  const position = positionFromTeam(team, index);
  const sideLabel = index === 0 ? "Derecha" : "Revés";

  const displayName = getSlotDisplayName(slot, team, index, userDisplayName);
  const slotAriaLabel = getSlotAriaLabel(team, sideLabel, displayName);
  const manageButtonAriaLabel = getManageButtonAriaLabel(slot?.kind);

  const isUser = slot?.kind === "user";
  const isSelf =
    slot?.kind === "user" &&
    Boolean(currentUserId) &&
    slot.player.id === currentUserId;

  return (
    <div
      role="region"
      aria-label={`Cupo Pareja ${team}, ${sideLabel}: ${displayName}`}
      className={cn(
        "group relative flex items-center justify-between rounded-xl border p-1 shadow-xs transition-all",
        isActive
          ? "border-primary bg-card"
          : "border-border bg-card",
      )}
    >
      <button
        type="button"
        onClick={() => onSlotClick(team, index)}
        aria-label={slotAriaLabel}
        aria-pressed={isActive}
        className={cn(
          "flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-left transition-all active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
          isActive ? "bg-muted font-semibold" : "hover:bg-muted",
        )}
      >
        <div
          className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
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
          <p className="truncate text-sm font-semibold leading-tight text-foreground">
            {displayName}
          </p>
          <span className="text-xs text-muted-foreground mt-0.5">
            {isUser ? sideLabel : `${sideLabel} · Cupo pendiente`}
          </span>
        </div>
      </button>

      <div className="flex items-center gap-1 pr-1">
        {isSelf ? (
          <div className="flex h-8 items-center px-2.5 rounded-lg bg-muted border border-border shadow-xs">
            <span className="text-xs font-bold text-foreground">Vos</span>
          </div>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          aria-label={manageButtonAriaLabel}
          onClick={() => onManageClick(team, index)}
        >
          <UsersRound className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
