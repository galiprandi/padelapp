export const MATCH_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DISPUTED: "DISPUTED",
  CANCELLED: "CANCELLED",
} as const;

export type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

export function formatStatus(status: MatchStatus): string {
  switch (status) {
    case MATCH_STATUS.CONFIRMED:
      return "Confirmado";
    case MATCH_STATUS.DISPUTED:
      return "En disputa";
    case MATCH_STATUS.CANCELLED:
      return "Cancelado";
    case MATCH_STATUS.PENDING:
    default:
      return "Pendiente";
  }
}

export function teamKeyForPosition(position: number, totalPlayers: number): "A" | "B" {
  if (totalPlayers <= 2) {
    return position === 0 ? "A" : "B";
  }
  return position < 2 ? "A" : "B";
}

export function defaultTeamLabel(teamKey: "A" | "B", totalPlayers: number): string {
  if (totalPlayers <= 2) {
    return teamKey === "A" ? "Jugador A" : "Jugador B";
  }
  return teamKey === "A" ? "Pareja A" : "Pareja B";
}

export function formatJoinSlotInvitationMessage(
  creatorName: string | null | undefined,
  teamLabel: string
): string {
  const trimmedCreator = creatorName?.trim();
  if (trimmedCreator) {
    return `${trimmedCreator} te invitó a sumarte como ${teamLabel}.`;
  }
  return `Te invitaron a sumarte como ${teamLabel}.`;
}
