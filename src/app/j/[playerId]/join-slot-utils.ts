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

export interface GetJoinSlotHelperMessageOptions {
  slotTaken: boolean;
  slotTakenByViewer: boolean;
  matchClosed: boolean;
  viewerAlreadyInMatch: boolean;
}

/**
 * Determines helper/warning message text for slot join status.
 */
export function getJoinSlotHelperMessage({
  slotTaken,
  slotTakenByViewer,
  matchClosed,
  viewerAlreadyInMatch,
}: GetJoinSlotHelperMessageOptions): string | null {
  if (slotTaken && !slotTakenByViewer) {
    return "Cupo ocupado, hablá con el organizador del partido.";
  }
  if (matchClosed) {
    return "El partido ya no admite nuevas confirmaciones.";
  }
  if (viewerAlreadyInMatch && !slotTakenByViewer) {
    return "Ya estás inscripto en otro cupo para este partido.";
  }
  return null;
}

export interface MinimalSlotItem {
  position: number;
}

/**
 * Groups match slots into team A and team B groups.
 */
export function groupMatchSlotsByTeam<T extends MinimalSlotItem>(
  slots: T[],
  totalPlayers: number
): Record<"A" | "B", T[]> {
  const teamGroups: Record<"A" | "B", T[]> = { A: [], B: [] };
  for (const slot of slots) {
    const key = teamKeyForPosition(slot.position, totalPlayers);
    teamGroups[key].push(slot);
  }
  return teamGroups;
}

export type JoinSlotRegionKind =
  | "header"
  | "invitation"
  | "match-detail"
  | "formation"
  | "footer";

/**
 * Generates Argentine Spanish ARIA landmark labels for Join Slot sections.
 */
export function getJoinSlotRegionAriaLabel(kind: JoinSlotRegionKind): string {
  switch (kind) {
    case "header":
      return "Encabezado de invitación";
    case "invitation":
      return "Mensaje de invitación";
    case "match-detail":
      return "Detalle del partido";
    case "formation":
      return "Formación de los equipos";
    case "footer":
      return "Confirmación de inscripción";
  }
}

/**
 * Returns badge text and styling variant classes for player confirmation status.
 */
export function getSlotStatusBadgeProps(resultConfirmed: boolean) {
  return {
    text: resultConfirmed ? "Confirmado" : "Pendiente",
    className: resultConfirmed
      ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"
      : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  };
}
