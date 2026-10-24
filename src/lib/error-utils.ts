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

/**
 * Retorna las clases CSS para el contenedor de pantalla completa de RootError.
 */
export function getRootErrorContainerClasses(customClassName?: string): string {
  return cn(
    "flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10",
    customClassName,
  );
}

/**
 * Retorna las clases CSS para el contenedor de nivel de aplicación en AppError.
 */
export function getAppErrorContainerClasses(customClassName?: string): string {
  return cn(
    "flex flex-col items-center justify-center gap-4 py-16 text-center",
    customClassName,
  );
}

/**
 * Retorna las clases CSS para el contenedor del ícono de alerta destructiva.
 */
export function getErrorIconContainerClasses(customClassName?: string): string {
  return cn(
    "flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10",
    customClassName,
  );
}

/**
 * Retorna el texto localizado para el botón de reintento en vistas de error.
 */
export function getErrorRetryButtonText(): string {
  return "Reintentar";
}

/**
 * Retorna el texto localizado para el botón de retorno al inicio en vistas de error.
 */
export function getErrorHomeButtonText(): string {
  return "Inicio";
}

/**
 * Retorna las clases CSS para la tipografía del título principal en tarjetas de error.
 */
export function getErrorHeadingTitleClasses(customClassName?: string): string {
  return cn("text-lg font-bold text-foreground", customClassName);
}

/**
 * Retorna las clases CSS para la tipografía de la descripción de mensaje en tarjetas de error.
 */
export function getErrorMessageDescriptionClasses(customClassName?: string): string {
  return cn("text-sm text-muted-foreground max-w-xs", customClassName);
}

/**
 * Retorna las clases CSS para el contenedor interior centrado de la tarjeta de error.
 */
export function getErrorCardContentClasses(customClassName?: string): string {
  return cn(
    "flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto",
    customClassName,
  );
}

/**
 * Retorna las clases CSS para el grupo de botones de acción en tarjetas de error.
 */
export function getErrorActionGroupClasses(customClassName?: string): string {
  return cn("flex gap-2 pt-2", customClassName);
}

/**
 * Retorna las clases CSS para los botones de acción (reintentar / ir al inicio) en pantallas de error,
 * aplicando respuesta táctil al toque y anillos de foco accesibles.
 */
export function getErrorActionButtonClasses(customClassName?: string): string {
  return cn(
    "active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
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
