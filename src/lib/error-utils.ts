import { cn } from "@/lib/utils";

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
export function getErrorHomeAriaLabel(destinationLabel?: string): string {
  if (destinationLabel) {
    return `Volver a ${destinationLabel}`;
  }
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

/**
 * Retorna las clases CSS base para el contenedor de la pantalla o bloque de error.
 */
export function getErrorContainerClasses(customClassName?: string): string {
  return cn(
    "flex flex-col items-center justify-center gap-4 py-16 text-center px-4",
    customClassName,
  );
}

export interface FormatErrorDetailsOptions {
  section?: string;
  fallbackMessage?: string;
  homeDestinationLabel?: string;
  customContainerClassName?: string;
}

export interface ErrorDetailsResult {
  title: string;
  message: string;
  retryAriaLabel: string;
  homeAriaLabel: string;
  regionAriaLabel: string;
  containerClasses: string;
}

/**
 * Genera un objeto consolidado con todos los textos, etiquetas ARIA accesibles
 * y clases CSS formateados para una pantalla o sección de error.
 */
export function formatErrorDetails(
  error: unknown,
  options?: FormatErrorDetailsOptions,
): ErrorDetailsResult {
  const {
    section,
    fallbackMessage,
    homeDestinationLabel,
    customContainerClassName,
  } = options ?? {};

  return {
    title: getErrorTitle(section),
    message: getErrorMessage(error, fallbackMessage),
    retryAriaLabel: getErrorRetryAriaLabel(section),
    homeAriaLabel: getErrorHomeAriaLabel(homeDestinationLabel),
    regionAriaLabel: getErrorRegionAriaLabel(section),
    containerClasses: getErrorContainerClasses(customContainerClassName),
  };
}
