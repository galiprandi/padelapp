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

/**
 * Returns solid CSS classes for the main MatchResultForm container.
 */
export function getMatchResultContainerClasses(): string {
  return "flex flex-col gap-6";
}

/**
 * Returns CSS classes for the inner content wrapper of MatchResultForm.
 */
export function getMatchResultContentWrapperClasses(): string {
  return "flex flex-col gap-6";
}

/**
 * Returns CSS classes for the closed/confirmed match card container.
 */
export function getMatchResultClosedCardClasses(): string {
  return "flex flex-col items-center justify-center text-center py-10 rounded-xl border border-border bg-card shadow-xs";
}

/**
 * Returns CSS classes for the trophy icon in closed match card.
 */
export function getMatchResultClosedTrophyClasses(): string {
  return "h-8 w-8 text-primary mb-3";
}

/**
 * Returns CSS classes for the score heading in closed match card.
 */
export function getMatchResultClosedScoreClasses(): string {
  return "text-3xl font-bold mb-1";
}

/**
 * Returns CSS classes for the confirmed notice description in closed match card.
 */
export function getMatchResultClosedDescriptionClasses(): string {
  return "text-xs text-muted-foreground mb-6";
}

/**
 * Returns CSS classes for the return to detail button in closed match card.
 */
export function getMatchResultClosedButtonClasses(): string {
  return "w-full transition-all active:scale-[0.98]";
}

/**
 * Returns CSS classes for the sets list wrapper container.
 */
export function getMatchResultSetsListContainerClasses(): string {
  return "flex flex-col gap-6";
}

/**
 * Returns CSS classes for each set section landmark container.
 */
export function getMatchResultSetSectionClasses(): string {
  return "space-y-3";
}

/**
 * Returns CSS classes for each set section title heading.
 */
export function getMatchResultSetTitleClasses(): string {
  return "text-sm font-bold text-foreground";
}

/**
 * Returns CSS classes for the teams list within a set.
 */
export function getMatchResultSetTeamsListClasses(): string {
  return "flex flex-col gap-4";
}

/**
 * Returns CSS classes for each team card within a set.
 */
export function getMatchResultTeamCardClasses(): string {
  return "space-y-3 rounded-xl border border-border bg-card p-4 shadow-xs";
}

/**
 * Returns CSS classes for the team header row.
 */
export function getMatchResultTeamHeaderClasses(): string {
  return "flex items-center justify-between";
}

/**
 * Returns CSS classes for the team info (avatars + text) container.
 */
export function getMatchResultTeamInfoClasses(): string {
  return "flex items-center gap-2 min-w-0";
}

/**
 * Returns CSS classes for the overlapping avatars group.
 */
export function getMatchResultTeamAvatarsClasses(): string {
  return "flex -space-x-2";
}

/**
 * Returns CSS classes for an individual team avatar.
 */
export function getMatchResultTeamAvatarClasses(): string {
  return "h-8 w-8 border-2 border-card";
}

/**
 * Returns CSS classes for the team label and names text container.
 */
export function getMatchResultTeamTextGroupClasses(): string {
  return "flex flex-col min-w-0";
}

/**
 * Returns CSS classes for the team label text.
 */
export function getMatchResultTeamLabelClasses(): string {
  return "text-xs text-muted-foreground";
}

/**
 * Returns CSS classes for the team player names text.
 */
export function getMatchResultTeamNamesClasses(): string {
  return "text-sm font-semibold text-foreground truncate";
}

/**
 * Returns CSS classes for the current set score badge badge.
 */
export function getMatchResultTeamScoreBadgeClasses(): string {
  return "flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl shrink-0 shadow-xs";
}

/**
 * Returns CSS classes for the set score radio group grid.
 */
export function getMatchResultScoreGridClasses(): string {
  return "grid grid-cols-4 gap-2";
}

/**
 * Returns CSS classes for the score option button (0-7 games) in a set.
 */
export function getMatchResultScoreOptionButtonClasses(isSelected: boolean): string {
  const baseClasses =
    "h-12 rounded-lg border text-lg font-bold transition-all active:scale-[0.98] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
  if (isSelected) {
    return `${baseClasses} bg-primary border-primary text-primary-foreground shadow-xs`;
  }
  return `${baseClasses} bg-card border-border text-muted-foreground hover:bg-muted`;
}

/**
 * Returns CSS classes for the court sides section container.
 */
export function getMatchResultSidesSectionClasses(): string {
  return "space-y-3";
}

/**
 * Returns CSS classes for the court sides section title.
 */
export function getMatchResultSidesTitleClasses(): string {
  return "text-sm font-bold text-foreground";
}

/**
 * Returns CSS classes for the court sides card container.
 */
export function getMatchResultSidesCardClasses(): string {
  return "rounded-xl border border-border bg-card p-4 space-y-4 shadow-xs";
}

/**
 * Returns CSS classes for each team block in court sides card.
 */
export function getMatchResultSidesTeamGroupClasses(): string {
  return "space-y-2";
}

/**
 * Returns CSS classes for team label inside court sides card.
 */
export function getMatchResultSidesTeamLabelClasses(): string {
  return "text-xs font-semibold text-muted-foreground block";
}

/**
 * Returns CSS classes for the players list inside court sides card.
 */
export function getMatchResultSidesPlayersListClasses(): string {
  return "divide-y divide-border";
}

/**
 * Returns CSS classes for each player row in court sides list.
 */
export function getMatchResultSidesPlayerRowClasses(): string {
  return "flex items-center justify-between py-2.5 first:pt-0 last:pb-0";
}

/**
 * Returns CSS classes for player info (avatar + name) in court sides row.
 */
export function getMatchResultSidesPlayerInfoClasses(): string {
  return "flex items-center gap-2.5 min-w-0";
}

/**
 * Returns CSS classes for player avatar in court sides row.
 */
export function getMatchResultSidesPlayerAvatarClasses(): string {
  return "h-8 w-8";
}

/**
 * Returns CSS classes for player name in court sides row.
 */
export function getMatchResultSidesPlayerNameClasses(): string {
  return "text-sm font-semibold text-foreground truncate";
}

/**
 * Returns CSS classes for the court side selector radiogroup container.
 */
export function getMatchResultSidesRadiogroupClasses(): string {
  return "flex items-center gap-1 bg-muted p-1 rounded-lg";
}
