export interface MatchPlayerInput {
  id: string;
  position: number;
  userId: string | null;
  displayName: string | null;
  teamId: string | null;
  resultConfirmed: boolean;
  side?: "RIGHT" | "LEFT" | null;
  attendance?: string | null;
  user?: {
    id: string;
    displayName: string | null;
    image: string | null;
  } | null;
  team?: {
    id: string;
    label: string;
  } | null;
}

export interface TeamDisplayPlayer {
  id: string;
  name: string;
  image?: string;
  isConfirmed: boolean;
  category?: number;
}

export interface TeamDisplay {
  id: string;
  label: string;
  players: TeamDisplayPlayer[];
}

/**
 * Parses initial score string into set scores array of size [setsCount][2].
 */
export function parseInitialScores(
  scoreStr: string | null | undefined,
  setsCount: number,
): number[][] {
  const safeSetsCount = Math.max(1, setsCount || 1);

  if (scoreStr) {
    const parsedScores = scoreStr
      .split(",")
      .map((s) => s.trim().split("-").map(Number));

    while (parsedScores.length < safeSetsCount) {
      parsedScores.push([0, 0]);
    }

    return parsedScores.map((set) => {
      const normalizedSet = [...set];
      while (normalizedSet.length < 2) {
        normalizedSet.push(0);
      }
      return normalizedSet.slice(0, 2).map((val) => (isNaN(val) ? 0 : val));
    });
  }

  return Array.from({ length: safeSetsCount }, () => [0, 0]);
}

/**
 * Formats scores array into comma-separated set string (e.g., "6-4, 3-6").
 */
export function buildScoreString(scores: number[][], setsCount: number): string {
  const safeSetsCount = Math.max(1, setsCount || 1);
  return scores
    .slice(0, safeSetsCount)
    .map((set) => `${set[0] ?? 0}-${set[1] ?? 0}`)
    .join(", ");
}

/**
 * Groups players by teamId into TeamDisplay objects.
 */
export function extractMatchTeams(players: MatchPlayerInput[]): TeamDisplay[] {
  const teamsMap = new Map<string, TeamDisplay>();

  players.forEach((player) => {
    if (player.teamId) {
      if (!teamsMap.has(player.teamId)) {
        teamsMap.set(player.teamId, {
          id: player.teamId,
          label: player.team?.label || `Equipo ${player.teamId.slice(-4)}`,
          players: [],
        });
      }
      teamsMap.get(player.teamId)!.players.push({
        id: player.id,
        name:
          player.displayName ||
          player.user?.displayName ||
          `Jugador ${player.position + 1}`,
        image: player.user?.image ? player.user.image : undefined,
        isConfirmed: player.resultConfirmed,
        category: player.user ? 5 : undefined,
      });
    }
  });

  return Array.from(teamsMap.values());
}

/**
 * Derives complementary court side for a teammate given a player's chosen side.
 */
export function calculateTeammateSide(
  currentSide: "RIGHT" | "LEFT" | null,
): "RIGHT" | "LEFT" | null {
  if (currentSide === "RIGHT") return "LEFT";
  if (currentSide === "LEFT") return "RIGHT";
  return null;
}

/**
 * Formats Argentine Spanish ARIA label describing match result status or form.
 */
export function getMatchResultAriaLabel(
  team1Label: string,
  team2Label: string,
  isClosed: boolean,
  score?: string | null,
): string {
  if (isClosed && score) {
    return `Resultado confirmado del partido entre ${team1Label} y ${team2Label}: ${score}`;
  }
  return `Formulario para cargar marcador del partido entre ${team1Label} y ${team2Label}`;
}

/**
 * Returns accessible ARIA label for match result loading skeleton state.
 */
export function getMatchResultSkeletonAriaLabel(): string {
  return "Cargando formulario de resultado del partido...";
}

/**
 * Formats toast notification message for successful match result save.
 */
export function getSaveMatchResultSuccessToast(): string {
  return "Guardaste el resultado.";
}

/**
 * Formats toast notification message for match result save error.
 */
export function getSaveMatchResultErrorToast(fallbackMessage?: string): string {
  if (fallbackMessage && fallbackMessage.trim().length > 0) {
    return fallbackMessage;
  }
  return "No pudimos guardar el resultado.";
}

/**
 * Generates Argentine Spanish accessible ARIA label for final score section when match is closed.
 */
export function getFinalScoreRegionAriaLabel(score: string): string {
  return `Resultado final del partido: ${score}`;
}

/**
 * Generates Argentine Spanish accessible ARIA label for set scores section.
 */
export function getSetScoresRegionAriaLabel(setIndex: number): string {
  return `Puntajes del Set ${setIndex + 1}`;
}

/**
 * Generates Argentine Spanish accessible ARIA label for player sides selection section.
 */
export function getPlayerSidesRegionAriaLabel(): string {
  return "Selección de posición en cancha por jugador";
}

/**
 * Generates Argentine Spanish accessible ARIA label for a player's court side selection radio group.
 */
export function getPlayerSideGroupAriaLabel(playerName: string): string {
  return `Lado para ${playerName}`;
}

/**
 * Generates Argentine Spanish accessible ARIA label for set score option buttons.
 */
export function getSetScoreButtonAriaLabel(scoreNum: number, teamLabel: string): string {
  return `${scoreNum} juegos para ${teamLabel}`;
}

/**
 * Generates Argentine Spanish accessible ARIA label for set score radio group.
 */
export function getSetScoreGroupAriaLabel(teamLabel: string, setIndex: number): string {
  return `Puntaje de ${teamLabel} para Set ${setIndex + 1}`;
}

/**
 * Returns primary navigation button label for registering match score.
 */
export function getRegisterScorePrimaryButtonText(isPending: boolean): string {
  if (isPending) {
    return "Guardando...";
  }
  return "Registrar Resultado";
}

/**
 * Returns secondary navigation button label for cancelling score entry.
 */
export function getCancelScoreSecondaryButtonText(): string {
  return "Cancelar";
}

/**
 * Returns localized heading text for confirmed match result.
 */
export function getConfirmedMatchTitle(): string {
  return "Partido ya confirmado";
}

/**
 * Returns localized text for returning to match detail button.
 */
export function getBackToDetailButtonText(): string {
  return "Volver al detalle";
}

/**
 * Returns localized header title for a specific set (e.g. "Set 1").
 */
export function getSetHeaderTitle(setIndex: number): string {
  return `Set ${setIndex + 1}`;
}

/**
 * Returns localized heading title for player court position selection.
 */
export function getPlayerSidesHeadingTitle(): string {
  return "Posición en cancha (Derecha / Revés)";
}

/**
 * Returns localized label for court side option button ("Derecha" / "Revés").
 */
export function getSideOptionButtonLabel(side: "RIGHT" | "LEFT"): string {
  if (side === "RIGHT") {
    return "Derecha";
  }
  return "Revés";
}

/**
 * Generates solid MDS CSS classes for court side selection option buttons.
 */
export function getSideOptionButtonClasses(isSelected: boolean): string {
  const baseClasses =
    "px-3 py-1.5 rounded-md text-xs font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
  if (isSelected) {
    return `${baseClasses} bg-background text-foreground shadow-xs`;
  }
  return `${baseClasses} text-muted-foreground hover:text-foreground`;
}
