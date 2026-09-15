/**
 * Retorna el título descriptivo para una pantalla o sección de error en la aplicación.
 */
export function getErrorTitle(section?: string): string {
  if (!section) return "Ocurrió un error inesperado";
  return `No pudimos cargar ${section}`;
}

/**
 * Formatea el mensaje de error para mostrar al usuario, usando un texto de respaldo si aplica.
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage?: string,
): string {
  if (fallbackMessage) return fallbackMessage;
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Ocurrió un problema al procesar la solicitud. Podés reintentar o volver al inicio.";
}

/**
 * Genera la etiqueta ARIA accesible para el botón de reintento.
 */
export function getErrorRetryAriaLabel(section?: string): string {
  return section ? `Reintentar cargar ${section}` : "Reintentar cargar la página";
}

/**
 * Genera la etiqueta ARIA accesible para el botón de retorno al inicio.
 */
export function getErrorHomeAriaLabel(): string {
  return "Volver al panel principal de Padel Red";
}

/**
 * Genera la etiqueta ARIA accesible para la región contenedor de error.
 */
export function getErrorRegionAriaLabel(section?: string): string {
  return section
    ? `Mensaje de error en ${section}`
    : "Mensaje de error inesperado de Padel Red";
}
