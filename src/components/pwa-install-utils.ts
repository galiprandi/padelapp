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

/**
 * Returns standardized CSS class string for the sidebar/footer InstallLinkButton.
 */
export function getInstallLinkClasses(): string {
  return "h-10 w-full rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
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

/**
 * Returns standardized CSS class string for the main PWA install banner container.
 */
export function getPwaBannerContainerClasses(): string {
  return "flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm";
}

/**
 * Returns standardized CSS class string for the icon badge container inside the PWA banner.
 */
export function getPwaBannerIconBadgeClasses(): string {
  return "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground";
}

/**
 * Returns standardized CSS class string for the dismiss button inside the PWA banner.
 */
export function getPwaBannerDismissButtonClasses(): string {
  return "rounded-md p-1.5 h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Returns standardized CSS class string for the primary install button inside the PWA banner.
 */
export function getPwaBannerInstallButtonClasses(): string {
  return "h-8 px-3 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all whitespace-nowrap disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background shrink-0";
}

/**
 * Returns standardized CSS class string for the view guide button inside the PWA banner.
 */
export function getPwaBannerGuideButtonClasses(): string {
  return "h-8 px-3 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background shrink-0";
}

/**
 * Returns standardized CSS class string for the text container inside the PWA banner.
 */
export function getPwaBannerTextContainerClasses(): string {
  return "flex-1 space-y-0.5";
}

/**
 * Returns standardized CSS class string for the title heading inside the PWA banner.
 */
export function getPwaBannerTitleClasses(): string {
  return "text-sm font-semibold text-foreground";
}

/**
 * Returns standardized CSS class string for the description text inside the PWA banner.
 */
export function getPwaBannerDescriptionClasses(): string {
  return "text-xs text-muted-foreground";
}

/**
 * Returns standardized CSS class string for the mobile icon inside the PWA banner.
 */
export function getPwaBannerIconClasses(): string {
  return "h-4 w-4";
}

/**
 * Returns standardized CSS class string for the dismiss icon inside the PWA banner.
 */
export function getPwaBannerDismissIconClasses(): string {
  return "h-4 w-4";
}

/**
 * Returns standardized CSS class string for the install loading spinner inside the PWA banner button.
 */
export function getPwaBannerButtonSpinnerClasses(): string {
  return "h-3.5 w-3.5 animate-spin mr-1";
}

/**
 * Returns standardized CSS class string for the download icon inside the PWA banner install button.
 */
export function getPwaBannerButtonIconClasses(): string {
  return "h-3.5 w-3.5 mr-1";
}

/**
 * Returns localized text for the guide button inside the PWA banner.
 */
export function getPwaBannerGuideButtonText(): string {
  return "Ver cómo";
}

/**
 * Returns localized text for the sidebar/footer install link button.
 */
export function getPwaInstallLinkText(): string {
  return "Instalar App";
}
