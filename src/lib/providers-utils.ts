/**
 * Formatea y devuelve la etiqueta accesible para el contenedor global de proveedores de contexto.
 */
export function formatProvidersRegionAriaLabel(customLabel?: string): string {
  if (customLabel && customLabel.trim() !== "") {
    return customLabel.trim();
  }
  return "Contexto global de aplicación y servicios";
}

/**
 * Devuelve la etiqueta accesible para el contenedor global de proveedores de contexto.
 */
export function getProvidersRegionAriaLabel(): string {
  return formatProvidersRegionAriaLabel();
}

/**
 * Devuelve los atributos ARIA para marcar el contenedor de proveedores como una región accesible.
 */
export function getProvidersRegionAriaAttributes(customLabel?: string): {
  role: "region";
  "aria-label": string;
} {
  return {
    role: "region",
    "aria-label": formatProvidersRegionAriaLabel(customLabel),
  };
}

/**
 * Determina si el componente PwaRegistrar debe activarse e inicializar el Service Worker.
 * Desactiva la registración cuando las pruebas o variables de entorno explícitas así lo especifican.
 */
export function isPwaRegistrarEnabled(
  disablePwaEnv?: string | boolean,
): boolean {
  if (disablePwaEnv === "true" || disablePwaEnv === true) {
    return false;
  }
  return true;
}

/**
 * Devuelve las clases CSS del contenedor global de proveedores.
 */
export function getProvidersContainerClasses(customClasses?: string): string {
  const baseClasses = "contents";
  if (!customClasses) {
    return baseClasses;
  }
  return `${baseClasses} ${customClasses}`.trim();
}

export interface SessionProviderPropsOptions {
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
}

/**
 * Retorna la configuración de opciones por defecto para SessionProvider.
 */
export function getSessionProviderProps(
  options?: SessionProviderPropsOptions,
): SessionProviderPropsOptions {
  return {
    refetchInterval: options?.refetchInterval,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  };
}

/**
 * Determina si la analítica o rastreo de rendimiento (Vercel Analytics) está activada.
 */
export function isAnalyticsEnabled(
  disableAnalyticsEnv?: string | boolean,
): boolean {
  if (disableAnalyticsEnv === "true" || disableAnalyticsEnv === true) {
    return false;
  }
  return true;
}

export interface ToastProviderPropsOptions {
  duration?: number;
  swipeDirection?: "right" | "left" | "up" | "down";
}

/**
 * Retorna las propiedades de configuración recomendadas para ToastProvider.
 */
export function getProvidersToastProviderProps(
  options?: ToastProviderPropsOptions,
): ToastProviderPropsOptions {
  return {
    duration: options?.duration ?? 4000,
    swipeDirection: options?.swipeDirection ?? "right",
  };
}
