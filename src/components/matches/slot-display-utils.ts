import { positionFromTeam } from "@/lib/match-utils";
import type { SlotValue, TeamKey } from "@/lib/match-types";

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
