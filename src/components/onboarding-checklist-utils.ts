import { cn } from "@/lib/utils";

export const ONBOARDING_CHECKLIST_DISMISS_KEY = "onboarding-checklist-dismissed";
export const ONBOARDING_REDIRECT_KEY = "onboarding-redirected";

export function isOnboardingChecklistDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_CHECKLIST_DISMISS_KEY) === "true";
}

export function dismissOnboardingChecklist(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_CHECKLIST_DISMISS_KEY, "true");
}

export function clearOnboardingChecklistDismissal(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_CHECKLIST_DISMISS_KEY);
}

export function hasOnboardingBeenRedirected(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ONBOARDING_REDIRECT_KEY) === "true";
}

export function setOnboardingRedirected(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ONBOARDING_REDIRECT_KEY, "true");
}

export function clearOnboardingRedirect(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ONBOARDING_REDIRECT_KEY);
}

export interface OnboardingStepsState {
  stepAliasCompleted: boolean;
  stepActivityCompleted: boolean;
  stepPwaCompleted: boolean;
  stepNotificationsCompleted: boolean;
}

export function calculateOnboardingProgress(steps: OnboardingStepsState): {
  completedCount: number;
  progressPercent: number;
} {
  const completedCount =
    (steps.stepAliasCompleted ? 1 : 0) +
    (steps.stepActivityCompleted ? 1 : 0) +
    (steps.stepPwaCompleted ? 1 : 0) +
    (steps.stepNotificationsCompleted ? 1 : 0);

  const progressPercent = Math.round((completedCount / 4) * 100);

  return { completedCount, progressPercent };
}

export function getStepStatusAriaLabel(
  stepNumber: number,
  title: string,
  isCompleted: boolean
): string {
  const status = isCompleted ? "completado" : "pendiente";
  return `Paso ${stepNumber}: ${title} (${status})`;
}

export function getOnboardingStepButtonAriaLabel(
  actionType: "alias" | "activity" | "pwa-install" | "pwa-guide" | "notifications",
  isBusy: boolean = false
): string {
  switch (actionType) {
    case "alias":
      return "Ir a configurar alias";
    case "activity":
      return "Crear tu primer turno de pádel";
    case "pwa-install":
      return isBusy
        ? "Instalando aplicación de pádel..."
        : "Instalar aplicación de pádel directamente";
    case "pwa-guide":
      return "Ver cómo instalar la aplicación";
    case "notifications":
      return isBusy
        ? "Activando notificaciones de la aplicación..."
        : "Solicitar permisos para notificaciones";
  }
}

/**
 * Returns localized ARIA landmark region label for the onboarding welcome guide container.
 */
export function getOnboardingRegionAriaLabel(): string {
  return "Guía de bienvenida de Padel Red";
}

/**
 * Returns localized title text for the onboarding welcome guide header.
 */
export function getOnboardingTitleText(): string {
  return "Guía de bienvenida 🎾";
}

/**
 * Returns localized description subtitle for the onboarding welcome guide.
 */
export function getOnboardingDescriptionText(): string {
  return "Completá estos 4 simples pasos para empezar a disfrutar de la red sin fricciones.";
}

/**
 * Returns localized accessible ARIA label for dismissing the welcome guide.
 */
export function getOnboardingDismissAriaLabel(): string {
  return "Descartar guía de bienvenida";
}

/**
 * Returns localized section header for the onboarding progress bar.
 */
export function getOnboardingProgressTitleText(): string {
  return "Progreso de preparación";
}

/**
 * Formats completed step count and percentage progress text.
 */
export function getOnboardingProgressText(completedCount: number, progressPercent: number): string {
  return `${completedCount} de 4 (${progressPercent}%)`;
}

/**
 * Returns localized success message when all 4 onboarding steps are completed.
 */
export function getOnboardingCompletedSuccessText(): string {
  return "¡Felicitaciones! Completaste tu preparación al 100%. Ya estás listo para jugar y salvar turnos en Padel Red.";
}

/**
 * Returns localized toast feedback message for push notification permission actions.
 */
export function getOnboardingNotificationToastMessage(
  type: "enabled" | "denied" | "unsupported"
): string {
  switch (type) {
    case "enabled":
      return "Activaste las notificaciones.";
    case "denied":
      return "Las notificaciones están bloqueadas.";
    case "unsupported":
      return "No soportado en este navegador";
  }
}

/**
 * Returns localized step header title text for onboarding steps.
 */
export function getOnboardingStepTitleText(
  step: "alias" | "activity" | "pwa" | "notifications"
): string {
  switch (step) {
    case "alias":
      return "Configurá tu alias en la cancha";
    case "activity":
      return "Creá tu primer turno";
    case "pwa":
      return "Instalá la aplicación (PWA)";
    case "notifications":
      return "Activá las notificaciones";
  }
}

/**
 * Returns localized step description text for onboarding steps.
 */
export function getOnboardingStepDescriptionText(
  step: "alias" | "activity" | "pwa" | "notifications"
): string {
  switch (step) {
    case "alias":
      return "Elegí tu nombre de juego para aparecer en los partidos y el ranking.";
    case "activity":
      return "Armá un turno, compartilo por WhatsApp y dejá que la red llene los cupos.";
    case "pwa":
      return "Accedé al instante a tus partidos desde tu pantalla de inicio en el celular.";
    case "notifications":
      return "Recibí alertas al instante cuando falten jugadores o confirmen resultados.";
  }
}

/**
 * Returns localized button text for onboarding step actions.
 */
export function getOnboardingStepButtonText(
  actionType: "alias" | "activity" | "pwa-install" | "pwa-guide" | "notifications"
): string {
  switch (actionType) {
    case "alias":
      return "Configurar alias";
    case "activity":
      return "Crear turno";
    case "pwa-install":
      return "Instalar ahora";
    case "pwa-guide":
      return "Ver cómo instalar";
    case "notifications":
      return "Activar notificaciones";
  }
}

/**
 * Returns standardized CSS class string for the main onboarding checklist container.
 */
export function getOnboardingContainerClasses(): string {
  return "rounded-xl border border-border bg-card p-5 shadow-sm space-y-5";
}

/**
 * Returns standardized CSS class string for the onboarding dismiss button.
 */
export function getOnboardingDismissButtonClasses(): string {
  return "rounded-md p-1.5 h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background shrink-0 active:scale-[0.98]";
}

/**
 * Returns standardized CSS class string for the step completion status badge.
 */
export function getOnboardingStepBadgeClasses(isCompleted: boolean): string {
  return `flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
    isCompleted
      ? "bg-primary border-primary text-primary-foreground"
      : "bg-muted border-border text-muted-foreground"
  }`;
}

/**
 * Returns standardized CSS class string for onboarding step CTA buttons.
 */
export function getOnboardingStepButtonClasses(): string {
  return "h-9 text-xs font-bold border-border hover:bg-muted text-foreground active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

export function getOnboardingHeaderClasses(customClassName?: string): string {
  return cn("flex items-start justify-between gap-4", customClassName);
}

export function getOnboardingHeaderTextContainerClasses(customClassName?: string): string {
  return cn("space-y-1", customClassName);
}

export function getOnboardingHeaderTitleClasses(customClassName?: string): string {
  return cn("text-base font-bold text-foreground", customClassName);
}

export function getOnboardingHeaderDescriptionClasses(customClassName?: string): string {
  return cn("text-xs text-muted-foreground leading-normal", customClassName);
}

export function getOnboardingDismissIconClasses(customClassName?: string): string {
  return cn("h-4 w-4", customClassName);
}

export function getOnboardingProgressContainerClasses(customClassName?: string): string {
  return cn("space-y-2", customClassName);
}

export function getOnboardingProgressHeaderClasses(customClassName?: string): string {
  return cn("flex justify-between items-center text-xs", customClassName);
}

export function getOnboardingProgressTitleClasses(customClassName?: string): string {
  return cn("font-semibold text-foreground", customClassName);
}

export function getOnboardingProgressValueClasses(customClassName?: string): string {
  return cn("font-bold text-primary tabular-nums", customClassName);
}

export function getOnboardingProgressBarBackgroundClasses(customClassName?: string): string {
  return cn("h-1.5 w-full bg-muted rounded-full overflow-hidden", customClassName);
}

export function getOnboardingProgressBarFillClasses(customClassName?: string): string {
  return cn("h-full bg-primary transition-all duration-500 ease-out rounded-full", customClassName);
}

export function getOnboardingStepsListClasses(customClassName?: string): string {
  return cn("space-y-4 pt-1", customClassName);
}

export function getOnboardingStepItemClasses(customClassName?: string): string {
  return cn("flex gap-3", customClassName);
}

export function getOnboardingStepBadgeColumnClasses(customClassName?: string): string {
  return cn("flex flex-col items-center", customClassName);
}

export function getOnboardingStepConnectorLineClasses(customClassName?: string): string {
  return cn("w-px flex-1 bg-border my-1 min-h-[16px]", customClassName);
}

export function getOnboardingStepContentClasses(hasPaddingBottom = false, customClassName?: string): string {
  return cn("flex-1 space-y-1", hasPaddingBottom && "pb-2", customClassName);
}

export function getOnboardingStepHeaderRowClasses(customClassName?: string): string {
  return cn("flex items-baseline justify-between gap-2", customClassName);
}

export function getOnboardingStepTitleClasses(customClassName?: string): string {
  return cn("text-xs font-bold text-foreground", customClassName);
}

export function getOnboardingStepDescriptionClasses(customClassName?: string): string {
  return cn("text-xs text-muted-foreground leading-normal", customClassName);
}

export function getOnboardingStepActionWrapperClasses(customClassName?: string): string {
  return cn("pt-1.5", customClassName);
}

export function getOnboardingStepCheckIconClasses(customClassName?: string): string {
  return cn("h-4 w-4", customClassName);
}

export function getOnboardingStepActionSpinnerClasses(customClassName?: string): string {
  return cn("h-3.5 w-3.5 animate-spin mr-1", customClassName);
}

export function getOnboardingStepActionDeviceIconClasses(customClassName?: string): string {
  return cn("h-3.5 w-3.5 mr-1", customClassName);
}

export function getOnboardingStepActionBellIconClasses(customClassName?: string): string {
  return cn("h-3.5 w-3.5 mr-1", customClassName);
}

export function getOnboardingUnsupportedNoticeClasses(customClassName?: string): string {
  return cn("text-xs text-muted-foreground font-medium", customClassName);
}

export function getOnboardingSuccessBannerClasses(customClassName?: string): string {
  return cn("rounded-lg bg-muted border border-primary p-3 text-center shadow-xs", customClassName);
}

export function getOnboardingSuccessTextClasses(customClassName?: string): string {
  return cn("text-xs font-bold text-foreground", customClassName);
}
