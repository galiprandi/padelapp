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
