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

/**
 * Returns accessible screen reader ARIA label for set score options.
 */
export function getScoreOptionAriaLabel(num: number): string {
  return num === 1 ? "1 juego" : `${num} juegos`;
}

/**
 * Returns the text for the suggest pairings button based on loading status.
 */
export function getSuggestPairingsButtonText(isSuggesting?: boolean): string {
  return isSuggesting ? "Sugiriendo..." : "Sugerir Parejas 🧠";
}

/**
 * Returns help text when suggest pairings is disabled.
 */
export function getSuggestPairingsHelpText(assignedCount: number): string {
  return `Completá los 4 cupos con jugadores reales para activar. (Asignados: ${assignedCount}/4)`;
}

/**
 * Returns the success toast message when pairings are suggested.
 */
export function getSuggestPairingsSuccessToast(): string {
  return "Acomodamos las parejas según el historial de juego y lado preferido de cada uno.";
}

/**
 * Returns the error toast message when suggest pairings fails.
 */
export function getSuggestPairingsErrorToast(customMessage?: string): string {
  return customMessage || "No pudimos obtener la sugerencia de parejas.";
}

/**
 * Returns accessible ARIA label for swapping team court positions.
 */
export function getSwapSidesButtonAriaLabel(team: "A" | "B"): string {
  return `Intercambiar derecha y revés de Pareja ${team}`;
}

/**
 * Returns the display label for set count options (e.g. "1 Set", "3 Sets").
 */
export function getSetOptionLabel(option: string): string {
  const parsed = parseInt(option, 10);
  return `${option} ${parsed === 1 ? "Set" : "Sets"}`;
}

/**
 * Returns accessible ARIA label for the new match loading skeleton screen.
 */
export function getNewMatchLoadingAriaLabel(): string {
  return "Cargando formulario de creación de partido";
}

/**
 * Returns display label for a recent club option.
 */
export function getRecentClubLabel(club: string, courtNumber?: string | null): string {
  return courtNumber ? `${club} · ${courtNumber}` : club;
}

/**
 * Checks if a recent club is currently selected.
 */
export function isRecentClubSelected(
  currentClub: string,
  currentCourt: string,
  itemClub: string,
  itemCourtNumber?: string | null
): boolean {
  return (
    currentClub === itemClub &&
    (!itemCourtNumber || currentCourt === itemCourtNumber)
  );
}

/**
 * Returns accessible ARIA label for a recent club option radio button.
 */
export function getRecentClubRadioAriaLabel(
  club: string,
  courtNumber?: string | null,
  isSelected?: boolean
): string {
  const label = getRecentClubLabel(club, courtNumber);
  return isSelected ? `${label}, club seleccionado` : `Seleccionar club ${label}`;
}

/**
 * Returns dynamic primary action button text across step navigation.
 */
export function getNewMatchPrimaryButtonText(params: {
  currentStep: number;
  recordScore?: boolean;
  isSubmitting?: boolean;
}): string {
  const { currentStep, recordScore, isSubmitting } = params;

  if (currentStep === 0) {
    return "Siguiente";
  }

  if (currentStep === 1) {
    return "Continuar";
  }

  if (currentStep === 2) {
    if (recordScore) return "Continuar";
    if (isSubmitting) return "Creando...";
    return "Crear partido";
  }

  if (isSubmitting) return "Creando...";
  return "Crear y finalizar";
}

/**
 * Returns accessible ARIA region label for form error alert banner.
 */
export function getFormErrorAlertAriaLabel(): string {
  return "Aviso de error en formulario";
}

/**
 * Formats error message for display in form error alert banner.
 */
export function formatFormErrorMessage(error: string | null | undefined): string {
  return error?.trim() || "";
}
