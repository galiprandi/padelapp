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

export function getPushPermissionActionButtonLabel(loading: boolean): string {
  return loading ? "Activando..." : "Activar";
}

export function getPushPermissionActionButtonAriaLabel(loading: boolean): string {
  return loading
    ? "Solicitando permisos de notificación"
    : "Activar notificaciones de la aplicación";
}

export function getPushPermissionDismissButtonAriaLabel(): string {
  return "Descartar solicitud de notificaciones por ahora";
}

export function getPushPermissionLiveStatus(loading: boolean): string {
  return loading
    ? "Solicitando activación de notificaciones de la aplicación..."
    : "";
}
