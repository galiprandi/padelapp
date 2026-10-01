/**
 * Funciones helper puras para la configuración, maquetación y accesibilidad del Root Layout y Root Loading.
 */

/**
 * Genera la composición de clases CSS para el tag <body> del Root Layout.
 * @param geistFontVariable Variable de fuente opcional definida por Next.js Geist font.
 */
export function getRootBodyClasses(geistFontVariable?: string): string {
  const fontClass = geistFontVariable ? `${geistFontVariable.trim()} ` : "";
  return `${fontClass}min-h-screen bg-background font-sans text-foreground`.trim();
}

/**
 * Retorna las propiedades HTML para el tag <html> raíz.
 */
export function getRootHtmlAttributes(): { lang: string } {
  return { lang: "es" };
}

/**
 * Retorna el mensaje accesible para la etiqueta ARIA de carga global del Root Loading skeleton.
 */
export function getRootLoadingAriaLabel(): string {
  return "Cargando Padel Red";
}

/**
 * Retorna las clases CSS para el contenedor principal de Root Loading skeleton.
 */
export function getRootLoadingClasses(): string {
  return "relative flex min-h-dvh flex-col bg-background px-6 py-10";
}
