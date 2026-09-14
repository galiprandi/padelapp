import type { TeamState, PlayerOption, SlotValue } from "@/lib/match-types";

/**
 * Extracts unique user IDs from current team state slots.
 */
export function extractUniqueUserIds(teamState: TeamState): string[] {
  const userIds: string[] = [];
  (["A", "B"] as const).forEach((team) => {
    teamState[team].forEach((slot) => {
      if (slot?.kind === "user") {
        userIds.push(slot.player.id);
      }
    });
  });
  return Array.from(new Set(userIds));
}

/**
 * Determines whether pairing suggestions can be requested (requires exactly 4 unique users).
 */
export function canSuggestPairings(teamState: TeamState): boolean {
  return extractUniqueUserIds(teamState).length === 4;
}

/**
 * Builds a Map of player ID to PlayerOption from team state user slots.
 */
export function buildUserOptionsMap(teamState: TeamState): Map<string, PlayerOption> {
  const map = new Map<string, PlayerOption>();
  (["A", "B"] as const).forEach((team) => {
    teamState[team].forEach((slot) => {
      if (slot?.kind === "user") {
        map.set(slot.player.id, slot.player);
      }
    });
  });
  return map;
}

/**
 * Builds a new TeamState based on suggested pairings and user options map.
 * Returns null if any player is missing from the options map.
 */
export function buildSuggestedTeamState(
  suggestedPairings: {
    teamA: { derecha: string; reves: string };
    teamB: { derecha: string; reves: string };
  },
  userOptionsMap: Map<string, PlayerOption>
): TeamState | null {
  const slotA0 = userOptionsMap.get(suggestedPairings.teamA.derecha);
  const slotA1 = userOptionsMap.get(suggestedPairings.teamA.reves);
  const slotB0 = userOptionsMap.get(suggestedPairings.teamB.derecha);
  const slotB1 = userOptionsMap.get(suggestedPairings.teamB.reves);

  if (!slotA0 || !slotA1 || !slotB0 || !slotB1) {
    return null;
  }

  return {
    A: [
      { kind: "user", player: slotA0 },
      { kind: "user", player: slotA1 },
    ],
    B: [
      { kind: "user", player: slotB0 },
      { kind: "user", player: slotB1 },
    ],
  };
}

/**
 * Determines whether current user needs to swap position in Team A based on stored preferences.
 */
export function shouldSwapUserPosition(params: {
  currentUser: { id: string } | null | undefined;
  teamState: TeamState;
  desiredPosition: "derecha" | "reves";
}): boolean {
  const { currentUser, teamState, desiredPosition } = params;
  if (!currentUser) return false;

  const slotA0 = teamState.A[0];
  const slotA1 = teamState.A[1];
  const userAt0 = slotA0?.kind === "user" && slotA0.player.id === currentUser.id;
  const userAt1 = slotA1?.kind === "user" && slotA1.player.id === currentUser.id;

  if (!userAt0 && !userAt1) return false;

  return (
    (desiredPosition === "reves" && userAt0) ||
    (desiredPosition === "derecha" && userAt1)
  );
}

/**
 * Returns accessible Argentine Spanish screen reader ARIA region label for each creation step.
 */
export function getStepRegionAriaLabel(currentStep: 0 | 1 | 2 | 3): string {
  switch (currentStep) {
    case 0:
      return "Paso 1: Armado de parejas y posiciones para nuevo partido";
    case 1:
      return "Paso 2: Selección de formato de juego y puntos de ranking";
    case 2:
      return "Paso 3: Sede, club y número de cancha opcional";
    case 3:
      return "Paso 4: Carga e ingreso de marcador final de sets";
    default:
      return "Formulario de creación de nuevo partido";
  }
}
