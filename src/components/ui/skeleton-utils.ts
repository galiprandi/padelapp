import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  role?: string;
}

/**
 * Determina si el elemento Skeleton o su contenedor posee atributos accesibles explícitos
 * (role, aria-label o aria-labelledby) que lo convierten en una región o estado accesible
 * para lectores de pantalla durante la carga por streaming.
 */
export function isAccessibleSkeletonContainer(
  props: Pick<SkeletonProps, "role" | "aria-label" | "aria-labelledby">,
): boolean {
  return Boolean(
    (props["aria-label"] && props["aria-label"].trim() !== "") ||
      (props["aria-labelledby"] && props["aria-labelledby"].trim() !== "") ||
      (props.role && props.role.trim() !== ""),
  );
}

/**
 * Calcula el atributo `aria-hidden` apropiado para el esqueleto de carga.
 * Si es un contenedor accesible con rol/etiqueta explícita, omite `aria-hidden` (undefined).
 * Si es un elemento puramente decorativo de reemplazo visual, asigna "true" por defecto.
 * Respeta el valor explícito si se pasa como prop `aria-hidden`.
 */
export function getSkeletonAriaAttributes(
  props: Pick<SkeletonProps, "aria-hidden" | "role" | "aria-label" | "aria-labelledby">,
): { "aria-hidden"?: boolean | "true" | "false" } {
  if (props["aria-hidden"] !== undefined) {
    return { "aria-hidden": props["aria-hidden"] };
  }

  const isAccessible = isAccessibleSkeletonContainer(props);
  return {
    "aria-hidden": isAccessible ? undefined : "true",
  };
}

/**
 * Combina las clases CSS base de animación y color de fondo de Skeleton con clases personalizadas.
 */
export function getSkeletonClasses(className?: string): string {
  return cn("animate-pulse rounded-md bg-muted", className);
}

/**
 * Formatea una etiqueta de accesibilidad ARIA localizada en español para una región de carga por streaming.
 */
export function getSkeletonRegionAriaLabel(sectionName?: string): string {
  if (!sectionName || !sectionName.trim()) {
    return "Cargando contenido...";
  }
  return `Cargando ${sectionName.trim()}...`;
}
