export type AttendanceStatus = "ATTENDED" | "LATE" | "NO_SHOW";
export type PlayerFeedback = "STRONGER" | "WEAKER" | null;

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  ATTENDED: "Presente",
  LATE: "Tarde",
  NO_SHOW: "No asistió",
};

export const ATTENDANCE_BADGE_CLASSES: Record<AttendanceStatus, string> = {
  ATTENDED:
    "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
  LATE: "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  NO_SHOW:
    "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800",
};

/**
 * Returns the human readable label for an attendance status badge.
 */
export function getAttendanceBadgeLabel(status: AttendanceStatus | null): string {
  if (!status) return "";
  return ATTENDANCE_STATUS_LABELS[status] ?? "";
}

/**
 * Returns solid MDS styling classes for an attendance status badge.
 */
export function getAttendanceBadgeClasses(status: AttendanceStatus | null): string {
  if (!status) return "";
  return ATTENDANCE_BADGE_CLASSES[status] ?? "";
}

/**
 * Generates an Argentine Spanish accessible ARIA screen reader label for attendance badge status.
 */
export function getAttendanceBadgeAriaLabel(status: AttendanceStatus | null): string {
  if (!status) return "";
  const label = getAttendanceBadgeLabel(status);
  return `Asistencia: ${label}`;
}

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

/**
 * Formats a localized Argentine Spanish toast message for successful attendance save.
 */
export function getAttendanceSaveSuccessToast(hasFeedback: boolean): string {
  if (hasFeedback) {
    return "Guardaste la asistencia y el feedback.";
  }
  return "Guardaste la asistencia, pero no pudimos registrar tu feedback.";
}

/**
 * Formats a localized Argentine Spanish toast message for attendance save error.
 */
export function getAttendanceSaveErrorToast(fallbackMessage?: string): string {
  if (fallbackMessage && fallbackMessage.trim().length > 0) {
    return fallbackMessage;
  }
  return "No pudimos guardar la asistencia.";
}

/**
 * Returns the human-readable label for the attendance save button.
 */
export function getAttendanceSaveButtonLabel(isPending: boolean): string {
  if (isPending) {
    return "Guardando asistencia...";
  }
  return "Guardar asistencia y feedback";
}

/**
 * Generates an Argentine Spanish accessible ARIA label for the attendance save button.
 */
export function getAttendanceSaveButtonAriaLabel(isPending: boolean): string {
  if (isPending) {
    return "Guardando asistencia y feedback de nivel de los jugadores";
  }
  return "Guardar asistencia y feedback de nivel de los jugadores";
}
