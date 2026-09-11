export type AttendanceStatus = "ATTENDED" | "LATE" | "NO_SHOW";
export type PlayerFeedback = "STRONGER" | "WEAKER" | null;

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  ATTENDED: "Presente",
  LATE: "Tarde",
  NO_SHOW: "No asistió",
};

/**
 * Generates an Argentine Spanish accessible ARIA label for attendance status radio buttons.
 */
export function getAttendanceStatusAriaLabel(
  status: AttendanceStatus,
  playerName: string,
): string {
  const label = ATTENDANCE_STATUS_LABELS[status] ?? "Presente";
  return `${label} - ${playerName}`;
}

/**
 * Generates an Argentine Spanish accessible ARIA label for player level feedback radio buttons.
 */
export function getPlayerFeedbackAriaLabel(
  feedbackType: "STRONGER" | "WEAKER",
  playerName: string,
): string {
  if (feedbackType === "STRONGER") {
    return `Calificar a ${playerName} como más fuerte`;
  }
  return `Calificar a ${playerName} como más flojo`;
}

/**
 * Formats a localized Argentine Spanish summary string for the attendance section header.
 */
export function getAttendanceSummaryText(totalPlayers: number): string {
  if (totalPlayers <= 0) {
    return "Confirmá la asistencia y calificá sutilmente el nivel de los jugadores.";
  }
  const playersText = totalPlayers === 1 ? "1 jugador" : `${totalPlayers} jugadores`;
  return `Confirmá la asistencia de ${playersText} y calificá sutilmente su nivel.`;
}
