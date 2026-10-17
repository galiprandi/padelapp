/**
 * Return a safe relative redirect URL derived from user-controlled input.
 *
 * Prevents open-redirect attacks by rejecting anything that is not a same-origin
 * relative path. Absolute URLs (https://evil.com) and protocol-relative URLs
 * (//evil.com) are discarded.
 */
/**
 * Returns the localized ARIA accessibility label for the main login options section landmark.
 */
export function getLoginRegionAriaLabel(): string {
  return "Opciones de inicio de sesión de Padel Red";
}

/**
 * Returns the localized ARIA accessibility label for the login form loading fallback state.
 */
export function getLoginLoadingAriaLabel(): string {
  return "Cargando opciones de inicio de sesión";
}

/**
 * Returns the localized terms of service acceptance notice string.
 */
export function getLoginTermsNoticeText(): string {
  return "Al continuar, aceptás nuestros términos de servicio.";
}

/**
 * Returns the localized alt text for the login logo image.
 */
export function getLoginLogoAltText(): string {
  return "Padel Red";
}

/**
 * Returns container CSS classes for the login page main wrapper.
 */
export function getLoginContainerClasses(): string {
  return "relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10";
}

/**
 * Returns container CSS classes for the login page content section.
 */
export function getLoginContentContainerClasses(): string {
  return "flex w-full max-w-sm flex-col items-center gap-12";
}

/**
 * Returns typography CSS classes for the login page terms notice.
 */
export function getLoginTermsNoticeClasses(): string {
  return "text-center text-xs text-muted-foreground";
}

/**
 * Returns the localized login page title text.
 */
export function getLoginTitleText(): string {
  return "Padel Red";
}

/**
 * Returns the localized login page tagline text.
 */
export function getLoginTaglineText(): string {
  return "Turnos que no se cancelan.\nTu comunidad de pádel en un solo lugar.";
}

/**
 * Returns the localized loading text for login fallback states.
 */
export function getLoginLoadingText(): string {
  return "Cargando…";
}

/**
 * Returns the localized ARIA accessibility label for the Google sign-in form landmark.
 */
export function getSignInFormAriaLabel(): string {
  return "Formulario de inicio de sesión con Google";
}

/**
 * Returns container CSS classes for the sign-in form element.
 */
export function getSignInFormClasses(className?: string): string {
  return className ? `w-full ${className}` : "w-full";
}

/**
 * Returns container CSS classes for the login page header block (logo + tagline).
 */
export function getLoginHeaderContainerClasses(): string {
  return "flex flex-col items-center gap-6";
}

/**
 * Returns typography CSS classes for the login page header title (H1).
 */
export function getLoginHeaderTitleClasses(): string {
  return "text-3xl font-bold text-foreground";
}

/**
 * Returns typography CSS classes for the login page header tagline paragraph.
 */
export function getLoginHeaderTaglineClasses(): string {
  return "text-sm text-muted-foreground max-w-[240px] whitespace-pre-line";
}

/**
 * Returns container CSS classes for the login page Suspense fallback loading indicator.
 */
export function getLoginFallbackContainerClasses(): string {
  return "flex h-12 w-full items-center justify-center rounded-xl bg-muted text-muted-foreground text-sm font-semibold";
}

/**
 * Returns container CSS classes for the login form wrapper containing sign-in action triggers.
 */
export function getLoginFormContainerClasses(): string {
  return "flex w-full flex-col gap-3";
}

/**
 * Returns the localized text displayed when Google sign-in is pending.
 */
export function getSignInPendingText(): string {
  return "Conectando…";
}

/**
 * Returns the button text for Google sign-in based on pending state and label.
 */
export function getSignInButtonText(pending: boolean, label = "Continuar con Google"): string {
  return pending ? getSignInPendingText() : label;
}

/**
 * Returns CSS classes for the Google sign-in button loading spinner.
 */
export function getSignInSpinnerClasses(): string {
  return "mr-2 h-5 w-5 animate-spin text-primary-foreground";
}

/**
 * Returns CSS classes for the Google sign-in button inner content wrapper.
 */
export function getSignInContentContainerClasses(): string {
  return "flex items-center justify-center gap-2";
}

export function safeCallbackUrl(url: string | undefined, fallback = "/me"): string {
  if (!url) return fallback;
  if (!url.startsWith("/")) return fallback;
  if (url.startsWith("//")) return fallback;
  return url;
}
