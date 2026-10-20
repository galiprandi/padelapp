"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UsersRound } from "lucide-react";
import { avatarFallback, positionFromTeam } from "@/lib/match-utils";
import type { SlotValue, TeamKey } from "@/lib/match-types";
import {
  getSlotDisplayName,
  getSlotAriaLabel,
  getManageButtonAriaLabel,
  getSlotRegionAriaLabel,
  getSlotSubtext,
  getSelfBadgeText,
  getSlotContainerClasses,
  getSlotButtonClasses,
  getSlotAvatarClasses,
  getSelfBadgeContainerClasses,
  getSlotManageButtonClasses,
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
  const slotRegionAriaLabel = getSlotRegionAriaLabel(team, sideLabel, displayName);

  const isUser = slot?.kind === "user";
  const isSelf =
    slot?.kind === "user" &&
    Boolean(currentUserId) &&
    slot.player.id === currentUserId;

  return (
    <div
      role="region"
      aria-label={slotRegionAriaLabel}
      className={getSlotContainerClasses(isActive)}
    >
      <button
        type="button"
        onClick={() => onSlotClick(team, index)}
        aria-label={slotAriaLabel}
        aria-pressed={isActive}
        className={getSlotButtonClasses(isActive)}
      >
        <div className={getSlotAvatarClasses(isActive)}>
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
            {getSlotSubtext(Boolean(isUser), sideLabel)}
          </span>
        </div>
      </button>

      <div className="flex items-center gap-1 pr-1">
        {isSelf ? (
          <div className={getSelfBadgeContainerClasses()}>
            <span className="text-xs font-bold text-foreground">{getSelfBadgeText()}</span>
          </div>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={getSlotManageButtonClasses()}
          aria-label={manageButtonAriaLabel}
          onClick={() => onManageClick(team, index)}
        >
          <UsersRound className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
