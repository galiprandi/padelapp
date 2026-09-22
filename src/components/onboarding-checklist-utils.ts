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
