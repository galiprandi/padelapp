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

export function safeCallbackUrl(url: string | undefined, fallback = "/me"): string {
  if (!url) return fallback;
  if (!url.startsWith("/")) return fallback;
  if (url.startsWith("//")) return fallback;
  return url;
}
