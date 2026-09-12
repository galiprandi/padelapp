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
