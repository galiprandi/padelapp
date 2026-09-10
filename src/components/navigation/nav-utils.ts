import { Home, CalendarDays, Trophy, User, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
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
