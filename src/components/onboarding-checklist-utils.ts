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
