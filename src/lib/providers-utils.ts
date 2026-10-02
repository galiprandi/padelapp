/**
 * Devuelve la etiqueta accesible para el contenedor global de proveedores de contexto.
 */
export function getProvidersRegionAriaLabel(): string {
  return "Contexto global de aplicación y servicios";
}

/**
 * Devuelve los atributos ARIA para marcar el contenedor de proveedores como una región accesible.
 */
export function getProvidersRegionAriaAttributes(): {
  role: "region";
  "aria-label": string;
} {
  return {
    role: "region",
    "aria-label": getProvidersRegionAriaLabel(),
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
