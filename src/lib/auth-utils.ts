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

export function safeCallbackUrl(url: string | undefined, fallback = "/me"): string {
  if (!url) return fallback;
  if (!url.startsWith("/")) return fallback;
  if (url.startsWith("//")) return fallback;
  return url;
}
