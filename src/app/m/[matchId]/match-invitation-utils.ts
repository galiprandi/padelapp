export const MATCH_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DISPUTED: "DISPUTED",
  CANCELLED: "CANCELLED",
} as const;

export function formatStatus(status: string): string {
  switch (status) {
    case MATCH_STATUS.PENDING:
      return "Pendiente";
    case MATCH_STATUS.CONFIRMED:
      return "Confirmado";
    case MATCH_STATUS.DISPUTED:
      return "En disputa";
    case MATCH_STATUS.CANCELLED:
      return "Cancelado";
    default:
      return status;
  }
}

export function teamKeyForPosition(
  position: number,
  totalPlayers: number,
): "A" | "B" {
  if (totalPlayers <= 2) {
    return position === 0 ? "A" : "B";
  }
  return position < 2 ? "A" : "B";
}

export function defaultTeamLabel(
  teamKey: "A" | "B",
  totalPlayers: number,
): string {
  if (totalPlayers <= 2) {
    return teamKey === "A" ? "Jugador A" : "Jugador B";
  }
  return teamKey === "A" ? "Pareja A" : "Pareja B";
}

export function getMatchInvitationTitle(matchType: string): string {
  return matchType === "FRIENDLY" ? "Partido Amistoso" : "Torneo Local";
}

export function getMatchInvitationMetadata(match: {
  club?: string | null;
  date?: Date | string | null;
} | null): { title: string; description: string } {
  if (!match) {
    return {
      title: "Partido no encontrado",
      description: "El partido que estás buscando no existe o fue cancelado.",
    };
  }

  const clubName = match.club || "el club";
  const formattedDate = match.date
    ? new Date(match.date).toLocaleDateString("es-AR")
    : "fecha por confirmar";

  return {
    title: `Invitación a Partido en ${clubName}`,
    description: `Sumate al partido en ${clubName} el ${formattedDate}.`,
  };
}
