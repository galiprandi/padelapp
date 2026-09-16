import { Home, CalendarDays, Trophy, User, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

export interface FabItemConfig {
  href: string;
  label: string;
}

export interface SplitNavItems {
  primaryItems: NavItem[];
  secondaryItems: NavItem[];
}

export interface NavItemAriaAttributes {
  "aria-label": string;
  "aria-current"?: "page";
}

export interface NotificationsBadgeAriaAttributes {
  role: "status";
  "aria-live": "polite";
  "aria-label": string;
}

export interface FabAriaAttributes {
  "aria-label": string;
}

/**
 * Retorna la etiqueta de accesibilidad ARIA para el contenedor de navegación principal.
 */
export function getBottomNavAriaLabel(): string {
  return "Navegación principal de Padel Red";
}

/**
 * Retorna la etiqueta de accesibilidad ARIA para el esqueleto de carga de la navegación principal.
 */
export function getBottomNavSkeletonAriaLabel(): string {
  return "Cargando navegación principal de Padel Red";
}

/**
 * Retorna la lista de ítems principales de navegación de la aplicación.
 */
export function getNavItems(): NavItem[] {
  return [
    { href: "/me", icon: Home, label: "Inicio" },
    { href: "/turnos", icon: CalendarDays, label: "Turnos" },
    { href: "/ranking", icon: Trophy, label: "Ranking" },
    { href: "/me/profile", icon: User, label: "Perfil" },
  ];
}

/**
 * Formatea la etiqueta de accesibilidad ARIA para el badge de notificaciones no leídas.
 */
export function formatNotificationsAriaLabel(count: number): string {
  if (count <= 0) return "";
  return count === 1
    ? "1 notificación pendiente"
    : `${count} notificaciones pendientes`;
}

/**
 * Formatea la cantidad numérica a mostrar en la insignia de notificaciones (máximo "99+").
 */
export function formatNotificationsDisplayCount(count: number): string {
  if (count <= 0) return "";
  return count > 99 ? "99+" : String(count);
}

/**
 * Determina si un enlace de navegación está activo en función de la ruta (pathname) actual.
 * Maneja coincidencia exacta para la raíz del dashboard ("/me"), subrutas especiales de perfil
 * ("/me/profile", "/me/security"), y coincidencia estándar por prefijo para otras secciones.
 */
export function isNavItemActive(itemHref: string, pathname: string | null): boolean {
  if (!pathname) return false;

  // Coincidencia exacta siempre tiene prioridad
  if (pathname === itemHref) return true;

  // El inicio del dashboard ("/me") sólo debe coincidir con "/me" exacto
  // para que subrutas como "/me/profile" o "/me/security" no resalten "Inicio"
  if (itemHref === "/me") {
    return false;
  }

  // La pestaña de perfil ("/me/profile") debe coincidir también con "/me/security" y subrutas de perfil
  if (itemHref === "/me/profile") {
    return (
      pathname.startsWith("/me/profile/") ||
      pathname === "/me/security" ||
      pathname.startsWith("/me/security/")
    );
  }

  // Coincidencia genérica por prefijo para otras rutas (ej: "/turnos/nuevo" coincide con "/turnos")
  if (itemHref !== "/") {
    return pathname.startsWith(itemHref + "/");
  }

  return false;
}

/**
 * Retorna los ítems de navegación divididos en dos grupos (primario y secundario)
 * para ubicarlos a la izquierda y derecha del botón de acción central (FAB).
 */
export function getSplitNavItems(): SplitNavItems {
  const items = getNavItems();
  return {
    primaryItems: items.slice(0, 2),
    secondaryItems: items.slice(2),
  };
}

/**
 * Retorna la configuración del botón de acción flotante central (FAB).
 */
export function getFabItemConfig(): FabItemConfig {
  return {
    href: "/match/new",
    label: "Crear partido",
  };
}

/**
 * Genera los atributos ARIA accesibles para un ítem de navegación según su estado activo.
 */
export function getNavItemAriaAttributes(
  item: NavItem,
  isActive: boolean,
): NavItemAriaAttributes {
  return {
    "aria-label": item.label,
    "aria-current": isActive ? "page" : undefined,
  };
}

/**
 * Genera los atributos ARIA accesibles para la insignia/badge de notificaciones.
 */
export function getNotificationsBadgeAriaAttributes(
  count: number,
): NotificationsBadgeAriaAttributes {
  return {
    role: "status",
    "aria-live": "polite",
    "aria-label": formatNotificationsAriaLabel(count),
  };
}

/**
 * Genera los atributos ARIA accesibles para el botón flotante de acción central (FAB).
 */
export function getFabAriaAttributes(): FabAriaAttributes {
  const fabConfig = getFabItemConfig();
  return {
    "aria-label": fabConfig.label,
  };
}
