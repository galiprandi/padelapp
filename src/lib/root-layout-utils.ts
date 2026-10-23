import { cn } from "@/lib/utils";

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
export function getRootLoadingClasses(customClassName?: string): string {
  return cn("relative flex min-h-dvh flex-col bg-background px-6 py-10", customClassName);
}

/**
 * Retorna las clases CSS para el contenedor interior flex del Root Loading skeleton.
 */
export function getRootLoadingInnerContainerClasses(customClassName?: string): string {
  return cn("flex w-full max-w-sm mx-auto flex-col gap-6", customClassName);
}

/**
 * Retorna las clases CSS para el bloque de héroe del Root Loading skeleton.
 */
export function getRootLoadingHeroClasses(customClassName?: string): string {
  return cn("flex flex-col items-center gap-4 pt-6", customClassName);
}

/**
 * Retorna las clases CSS para el contenedor de texto del héroe en el Root Loading skeleton.
 */
export function getRootLoadingHeroTextClasses(customClassName?: string): string {
  return cn("space-y-2 text-center flex flex-col items-center w-full", customClassName);
}

/**
 * Retorna las clases CSS para la tarjeta de característica en el Root Loading skeleton.
 */
export function getRootLoadingCardClasses(customClassName?: string): string {
  return cn("flex items-start gap-3 rounded-xl border border-border bg-card p-4", customClassName);
}

/**
 * Retorna las clases CSS para el bloque de llamadas a la acción (CTA) en el Root Loading skeleton.
 */
export function getRootLoadingCtaClasses(customClassName?: string): string {
  return cn("flex flex-col gap-3 pt-2", customClassName);
}

/**
 * Retorna las clases CSS para la lista de tarjetas de características en el Root Loading skeleton.
 */
export function getRootLoadingFeaturesListClasses(customClassName?: string): string {
  return cn("flex flex-col gap-3", customClassName);
}

/**
 * Retorna las clases CSS para el contenido interno de la tarjeta de característica en el Root Loading skeleton.
 */
export function getRootLoadingCardContentClasses(customClassName?: string): string {
  return cn("space-y-2 flex-1 pt-1", customClassName);
}

/**
 * Retorna la lista de identificadores numéricos de tarjetas de características para iterar en el Root Loading skeleton.
 */
export function getRootLoadingFeatureCardKeys(): number[] {
  return [1, 2, 3];
}

/**
 * Retorna las clases CSS para el esqueleto del avatar de héroe en el Root Loading skeleton.
 */
export function getRootLoadingHeroAvatarSkeletonClasses(customClassName?: string): string {
  return cn("h-20 w-20 rounded-2xl", customClassName);
}

/**
 * Retorna las clases CSS para el esqueleto del título de héroe en el Root Loading skeleton.
 */
export function getRootLoadingHeroTitleSkeletonClasses(customClassName?: string): string {
  return cn("h-8 w-3/4 rounded-lg", customClassName);
}

/**
 * Retorna las clases CSS para el esqueleto del subtítulo de héroe en el Root Loading skeleton.
 */
export function getRootLoadingHeroSubtitleSkeletonClasses(customClassName?: string): string {
  return cn("h-5 w-1/3 rounded-md", customClassName);
}

/**
 * Retorna las clases CSS para el esqueleto del eslogan/tagline de héroe en el Root Loading skeleton.
 */
export function getRootLoadingHeroTaglineSkeletonClasses(customClassName?: string): string {
  return cn("h-4 w-5/6 rounded-md", customClassName);
}

/**
 * Retorna las clases CSS para el esqueleto del ícono de la tarjeta de característica en el Root Loading skeleton.
 */
export function getRootLoadingCardIconSkeletonClasses(customClassName?: string): string {
  return cn("h-10 w-10 shrink-0 rounded-lg", customClassName);
}

/**
 * Retorna las clases CSS para el esqueleto del título de la tarjeta de característica en el Root Loading skeleton.
 */
export function getRootLoadingCardTitleSkeletonClasses(customClassName?: string): string {
  return cn("h-4 w-1/2 rounded-md", customClassName);
}

/**
 * Retorna las clases CSS para el esqueleto del texto de la tarjeta de característica en el Root Loading skeleton.
 */
export function getRootLoadingCardTextSkeletonClasses(customClassName?: string): string {
  return cn("h-3 w-full rounded-md", customClassName);
}

/**
 * Retorna las clases CSS para el esqueleto del subtexto de la tarjeta de característica en el Root Loading skeleton.
 */
export function getRootLoadingCardSubtextSkeletonClasses(customClassName?: string): string {
  return cn("h-3 w-4/5 rounded-md", customClassName);
}

/**
 * Retorna las clases CSS para el esqueleto de un botón CTA en el Root Loading skeleton.
 */
export function getRootLoadingCtaButtonSkeletonClasses(customClassName?: string): string {
  return cn("h-12 w-full rounded-lg", customClassName);
}

/**
 * Retorna las clases CSS para el esqueleto del pie de página CTA en el Root Loading skeleton.
 */
export function getRootLoadingCtaFooterSkeletonClasses(customClassName?: string): string {
  return cn("h-3 w-2/3 mx-auto rounded-md", customClassName);
}
