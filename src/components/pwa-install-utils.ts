export const PWA_BANNER_DISMISS_KEY = "pwa-banner-dismissed";

export function isPwaBannerDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PWA_BANNER_DISMISS_KEY) === "true";
}

export function dismissPwaBanner(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PWA_BANNER_DISMISS_KEY, "true");
}

export function clearPwaBannerDismissal(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PWA_BANNER_DISMISS_KEY);
}

export function getPwaBannerRegionAriaLabel(): string {
  return "Aviso de instalación de Padel Red";
}

export function getInstallButtonAriaLabel(isInstalling: boolean): string {
  return isInstalling
    ? "Instalando aplicación de pádel..."
    : "Instalar aplicación de pádel";
}

export function getInstallGuideAriaLabel(): string {
  return "Ver cómo instalar la aplicación de pádel";
}

export function getPwaInstallLinkAriaLabel(): string {
  return "Ver instrucciones de instalación de Padel Red";
}

export function getDismissBannerAriaLabel(): string {
  return "Cerrar aviso de instalación";
}

/**
 * Returns localized header title text for the PWA install banner.
 */
export function getPwaBannerTitleText(): string {
  return "Instalá la App";
}

/**
 * Returns localized description subtitle for the PWA install banner.
 */
export function getPwaBannerDescriptionText(): string {
  return "Accedé más rápido desde tu inicio.";
}

/**
 * Returns localized ARIA label for the mobile app icon inside the PWA install banner.
 */
export function getPwaBannerIconAriaLabel(): string {
  return "Icono de aplicación móvil";
}

/**
 * Returns localized primary action button text for the PWA install banner.
 */
export function getPwaBannerInstallButtonText(): string {
  return "Instalar";
}
