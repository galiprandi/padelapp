/**
 * Pure helper functions for MatchPlayersManager component notifications,
 * status messages, and accessibility ARIA labels in Argentine Spanish voseo conventions.
 */

export function getAssignUserSuccessToast(displayName: string): string {
  return `Asignaste a ${displayName} al partido.`;
}

export function getAssignUserErrorToast(message?: string | null): string {
  return message ?? "No pudimos asignar al jugador.";
}

export function getRenamePlaceholderSuccessToast(): string {
  return "Actualizaste el jugador.";
}

export function getRenamePlaceholderErrorToast(message?: string | null): string {
  return message ?? "No pudimos actualizar el jugador.";
}

export function getShareInviteText(nameToShare: string): string {
  return `Sumate al partido como ${nameToShare}`;
}

export function getCopyInviteSuccessToast(): string {
  return "Copiaste el enlace.";
}

export function getCopyInviteErrorToast(): string {
  return "No pudimos copiar el enlace.";
}

export function getReleaseSlotSuccessToast(): string {
  return "Liberaste el cupo.";
}

export function getReleaseSlotErrorToast(message?: string | null): string {
  return message ?? "No pudimos liberar el cupo.";
}

export function getSwapSelectPromptToast(): string {
  return "Seleccioná el otro jugador para intercambiar.";
}

export function getSwapSuccessToast(): string {
  return "Intercambiaste las posiciones.";
}

export function getSwapErrorToast(message?: string | null): string {
  return message ?? "No pudimos realizar el cambio.";
}

export function getSwapModeStatusAriaLabel(): string {
  return "Modo intercambio activo. Seleccioná otro jugador o presioná Escape para cancelar.";
}

export function getSwapModeCancelAriaLabel(): string {
  return "Cancelar intercambio de posición";
}

export function getMatchTeamsRegionAriaLabel(): string {
  return "Alineación y parejas del partido";
}

export function getPlayerManageAriaLabel(playerName: string): string {
  return `Gestionar jugador ${playerName}`;
}
