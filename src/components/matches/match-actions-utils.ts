/**
 * Pure helper functions for Match Actions (Cancel, Confirm Result, Finalize)
 */

export function getCancelMatchAriaLabel(): string {
  return "Eliminar este partido";
}

export function getCancelMatchConfirmRegionAriaLabel(): string {
  return "Confirmación de eliminación del partido";
}

export function getCancelMatchCancelAriaLabel(): string {
  return "Cancelar eliminación del partido";
}

export function getCancelMatchSubmitAriaLabel(isPending: boolean): string {
  return isPending ? "Eliminando partido..." : "Confirmar eliminación del partido";
}

export function getCancelMatchSuccessToast(): string {
  return "Eliminaste el partido.";
}

export function getCancelMatchErrorToast(message?: string): string {
  return message || "No pudimos eliminar el partido.";
}

export function getConfirmResultRegionAriaLabel(): string {
  return "Acción para confirmar resultado del partido";
}

export function getConfirmResultAriaLabel(isPending: boolean): string {
  return isPending ? "Confirmando resultado del partido..." : "Confirmar resultado del partido";
}

export function getConfirmResultSuccessToast(): string {
  return "Confirmaste el resultado. 🏆";
}

export function getConfirmResultErrorToast(message?: string): string {
  return message || "No pudimos confirmar el resultado.";
}

export function getFinalizeMatchRegionAriaLabel(): string {
  return "Acción para finalizar partido como organizador";
}

export function getFinalizeMatchAriaLabel(isPending: boolean): string {
  return isPending ? "Finalizando partido..." : "Finalizar el partido como organizador";
}

export function getFinalizeMatchSuccessToast(): string {
  return "Finalizaste el partido. 🏆";
}

export function getFinalizeMatchErrorToast(message?: string): string {
  return message || "No pudimos finalizar el partido.";
}
