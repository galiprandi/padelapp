import { positionFromTeam } from "@/lib/match-utils";
import type { SlotValue, TeamKey } from "@/lib/match-types";
import { cn } from "@/lib/utils";

/**
 * Returns the resolved display name for a match slot based on its assignment state.
 */
export function getSlotDisplayName(
  slot: SlotValue | null,
  team: TeamKey,
  index: 0 | 1,
  userDisplayName: string,
): string {
  if (slot?.kind === "user") {
    return slot.player.displayName;
  }
  if (slot?.kind === "placeholder") {
    return slot.displayName;
  }
  if (team === "A" && index === 0) {
    return userDisplayName;
  }
  const position = positionFromTeam(team, index);
  return `Jugador ${position + 1}`;
}

/**
 * Generates an accessible screen reader ARIA label for selecting a match slot.
 */
export function getSlotAriaLabel(
  team: TeamKey,
  sideLabel: string,
  displayName: string,
): string {
  return `Seleccionar Pareja ${team}, ${sideLabel}: ${displayName}`;
}

/**
 * Generates an accessible screen reader ARIA label for managing a match slot button.
 */
export function getManageButtonAriaLabel(slotKind?: "user" | "placeholder"): string {
  if (slotKind === "placeholder") {
    return "Gestionar nombre del cupo";
  }
  if (slotKind === "user") {
    return "Cambiar jugador";
  }
  return "Asignar jugador";
}

/**
 * Generates an accessible screen reader ARIA landmark label for a match slot region container.
 */
export function getSlotRegionAriaLabel(
  team: TeamKey,
  sideLabel: string,
  displayName: string,
): string {
  return `Cupo Pareja ${team}, ${sideLabel}: ${displayName}`;
}

/**
 * Returns formatted subtext label for a match slot (e.g., "Derecha" or "Derecha · Cupo pendiente").
 */
export function getSlotSubtext(isUser: boolean, sideLabel: string): string {
  return isUser ? sideLabel : `${sideLabel} · Cupo pendiente`;
}

/**
 * Returns localized Argentine Spanish badge text for self user indicator.
 */
export function getSelfBadgeText(): string {
  return "Vos";
}

/**
 * Returns Tailwind CSS class names for slot display container card.
 */
export function getSlotContainerClasses(isActive: boolean): string {
  return cn(
    "group relative flex items-center justify-between rounded-xl border p-1 shadow-xs transition-all",
    isActive ? "border-primary bg-card" : "border-border bg-card",
  );
}

/**
 * Returns Tailwind CSS class names for slot display selection button.
 */
export function getSlotButtonClasses(isActive: boolean): string {
  return cn(
    "flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-left transition-all active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    isActive ? "bg-muted font-semibold" : "hover:bg-muted",
  );
}

/**
 * Returns Tailwind CSS class names for slot avatar/position numeric badge container.
 */
export function getSlotAvatarClasses(isActive: boolean): string {
  return cn(
    "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition-colors",
    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
  );
}

/**
 * Returns Tailwind CSS class names for self badge indicator container.
 */
export function getSelfBadgeContainerClasses(): string {
  return "flex h-8 items-center px-2.5 rounded-lg bg-muted border border-border shadow-xs";
}

/**
 * Returns Tailwind CSS class names for slot manage button.
 */
export function getSlotManageButtonClasses(): string {
  return "h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}
