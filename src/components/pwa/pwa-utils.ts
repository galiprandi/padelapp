export const SERVICE_WORKER_SCRIPT_URL = "/firebase-messaging-sw.js";

/**
 * Checks if the Badging API is supported by the current browser/navigator environment.
 */
export function isBadgingSupported(
  nav: Navigator | undefined = typeof navigator !== "undefined" ? navigator : undefined,
): boolean {
  return typeof nav !== "undefined" && nav !== null && "setAppBadge" in nav;
}

/**
 * Checks if Service Worker registration is supported by the current browser/navigator environment.
 */
export function isServiceWorkerSupported(
  nav: Navigator | undefined = typeof navigator !== "undefined" ? navigator : undefined,
): boolean {
  return typeof nav !== "undefined" && nav !== null && "serviceWorker" in nav;
}

/**
 * Sanitizes a numeric badge counter value to ensure a non-negative integer.
 */
export function sanitizeBadgeCount(count: number): number {
  if (typeof count !== "number" || isNaN(count) || count < 0) {
    return 0;
  }
  return Math.floor(count);
}

/**
 * Updates the app icon badge counter using the Badging API if supported.
 * Returns true if successful, false if unsupported or if an error occurred.
 */
export async function updateAppBadge(
  count: number,
  nav: Navigator | undefined = typeof navigator !== "undefined" ? navigator : undefined,
): Promise<boolean> {
  if (!isBadgingSupported(nav) || !nav) return false;

  const sanitized = sanitizeBadgeCount(count);

  try {
    if (sanitized > 0) {
      await nav.setAppBadge(sanitized);
    } else {
      await nav.clearAppBadge();
    }
    return true;
  } catch {
    // Badging API can fail if app is not installed or permission is denied — silently ignore
    return false;
  }
}

/**
 * Clears the app icon badge using the Badging API if supported.
 * Returns true if successful, false if unsupported or if an error occurred.
 */
export async function clearAppBadge(
  nav: Navigator | undefined = typeof navigator !== "undefined" ? navigator : undefined,
): Promise<boolean> {
  if (!isBadgingSupported(nav) || !nav) return false;

  try {
    await nav.clearAppBadge();
    return true;
  } catch {
    // Badging API can fail if app is not installed or permission is denied — silently ignore
    return false;
  }
}

/**
 * Returns the relative URL path for the Service Worker script registration.
 */
export function getServiceWorkerRegistrationUrl(): string {
  return SERVICE_WORKER_SCRIPT_URL;
}

/**
 * Formats a localized screen-reader ARIA label describing pending actions for the app badge.
 */
export function formatAppBadgeAriaLabel(count: number): string {
  const sanitized = sanitizeBadgeCount(count);
  if (sanitized === 0) {
    return "Sin acciones pendientes";
  }
  if (sanitized === 1) {
    return "1 acción pendiente";
  }
  return `${sanitized} acciones pendientes`;
}

/**
 * Returns ARIA landmark and live region attributes for the AppBadgeUpdater component.
 */
export function getAppBadgeAriaAttributes(count: number) {
  return {
    role: "region" as const,
    "aria-label": formatAppBadgeAriaLabel(count),
    "aria-live": "polite" as const,
  };
}

/**
 * Returns localized ARIA label describing the background Service Worker registrar component.
 */
export function getPwaRegistrarAriaLabel(): string {
  return "Registro de Service Worker PWA";
}

/**
 * Formats a debug log message when Service Worker registration succeeds.
 */
export function getPwaRegistrarSuccessLogMessage(scope?: string): string {
  return scope
    ? `Service Worker registrado exitosamente en el scope: ${scope}`
    : "Service Worker registrado exitosamente";
}

/**
 * Formats a warning log message when Service Worker registration is skipped or fails.
 */
export function getPwaRegistrarErrorWarnMessage(error?: unknown): string {
  if (error instanceof Error) {
    return `Omitida la registración proactiva de Service Worker: ${error.message}`;
  }
  return "Omitida la registración proactiva de Service Worker";
}
