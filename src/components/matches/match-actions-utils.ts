/**
 * Pure helper functions for Match Actions (Cancel, Confirm Result, Finalize)
 */

export function getCancelMatchButtonText(): string {
  return "Eliminar Partido";
}

export function getCancelMatchConfirmButtonText(isPending: boolean): string {
  return isPending ? "Eliminando..." : "Confirmar";
}

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

export function getConfirmResultButtonText(isPending: boolean): string {
  return isPending ? "Confirmando..." : "Confirmar Resultado";
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

export function getFinalizeMatchButtonText(isPending: boolean): string {
  return isPending ? "Finalizando..." : "Finalizar como Organizador";
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

export function getCancelMatchTriggerButtonClasses(): string {
  return "w-full h-10 rounded-lg text-xs font-bold text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all shadow-xs";
}

export function getCancelMatchCancelButtonClasses(): string {
  return "h-10 px-2 rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all shadow-xs";
}

export function getCancelMatchConfirmSubmitButtonClasses(): string {
  return "flex-1 h-10 rounded-lg text-xs font-bold text-destructive border border-destructive/20 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all shadow-xs";
}

export function getConfirmResultSubmitButtonClasses(): string {
  return "w-full h-12 rounded-lg text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all shadow-xs";
}

export function getFinalizeMatchSubmitButtonClasses(): string {
  return "w-full h-10 border-border bg-card text-foreground font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all shadow-xs";
}
