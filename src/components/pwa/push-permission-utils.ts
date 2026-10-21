import { cn } from "@/lib/utils";

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

export function getPushPermissionContainerClasses(customClassName?: string): string {
  return cn("rounded-xl border border-border bg-card p-4 shadow-xs", customClassName);
}

export function getPushPermissionIconBadgeClasses(customClassName?: string): string {
  return cn(
    "flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground border border-border shadow-xs shrink-0",
    customClassName
  );
}

export function getPushPermissionActionButtonClasses(customClassName?: string): string {
  return cn(
    "h-9 font-bold active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    customClassName
  );
}

export function getPushPermissionDismissButtonClasses(customClassName?: string): string {
  return cn(
    "h-9 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    customClassName
  );
}

export function getPushPermissionInnerLayoutClasses(customClassName?: string): string {
  return cn("flex items-start gap-3", customClassName);
}

export function getPushPermissionTextContainerClasses(customClassName?: string): string {
  return cn("flex-1 min-w-0", customClassName);
}

export function getPushPermissionTitleClasses(customClassName?: string): string {
  return cn("text-sm font-bold text-foreground", customClassName);
}

export function getPushPermissionDescriptionClasses(customClassName?: string): string {
  return cn("mt-1 text-xs text-muted-foreground leading-normal", customClassName);
}

export function getPushPermissionActionGroupClasses(customClassName?: string): string {
  return cn("mt-3 flex items-center gap-2", customClassName);
}

export function getPushPermissionBellIconClasses(customClassName?: string): string {
  return cn("h-5 w-5", customClassName);
}

export function getPushPermissionActionBellIconClasses(customClassName?: string): string {
  return cn("h-3.5 w-3.5", customClassName);
}

export function getPushPermissionActionSpinnerClasses(customClassName?: string): string {
  return cn("h-3.5 w-3.5 animate-spin", customClassName);
}
