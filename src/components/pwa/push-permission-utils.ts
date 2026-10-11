export const PUSH_PROMPT_DISMISS_KEY = "push-prompt-dismissed";

export function isPushPromptDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PUSH_PROMPT_DISMISS_KEY) === "true";
}

export function dismissPushPrompt(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PUSH_PROMPT_DISMISS_KEY, "true");
}

export function clearPushPromptDismissal(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PUSH_PROMPT_DISMISS_KEY);
}

export function getPushPermissionRegionAriaLabel(): string {
  return "Aviso de notificaciones del sistema";
}

export function getPushPermissionTitle(): string {
  return "Activar notificaciones";
}

export function getPushPermissionDescription(): string {
  return "Recibí avisos cuando abran un cupo en tu red o necesiten confirmar un resultado.";
}

export function getPushPermissionActionButtonLabel(loading: boolean): string {
  return loading ? "Activando..." : "Activar";
}

export function getPushPermissionActionButtonAriaLabel(loading: boolean): string {
  return loading
    ? "Solicitando permisos de notificación"
    : "Activar notificaciones de la aplicación";
}

export function getPushPermissionDismissButtonText(): string {
  return "Ahora no";
}

export function getPushPermissionDismissButtonAriaLabel(): string {
  return "Descartar solicitud de notificaciones por ahora";
}

export function getPushPermissionSuccessToast(): string {
  return "Activaste las notificaciones.";
}

export function getPushPermissionLiveStatus(loading: boolean): string {
  return loading
    ? "Solicitando activación de notificaciones de la aplicación..."
    : "";
}

export function getPushPermissionContainerClasses(): string {
  return "rounded-xl border border-border bg-card p-4 shadow-xs";
}

export function getPushPermissionIconBadgeClasses(): string {
  return "flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground border border-border shadow-xs shrink-0";
}

export function getPushPermissionActionButtonClasses(): string {
  return "h-9 font-bold active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

export function getPushPermissionDismissButtonClasses(): string {
  return "h-9 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}
