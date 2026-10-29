import { Home, CalendarDays, Trophy, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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

export interface BottomNavAriaAttributes {
  role: "navigation";
  "aria-label": string;
}

export interface NotificationsBadgeAriaAttributes {
  role: "status";
  "aria-live": "polite";
  "aria-label": string;
}

export interface BottomNavSkeletonAriaAttributes {
  role: "status";
  "aria-busy": "true";
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
 * Genera los atributos ARIA accesibles para el contenedor de la navegación principal.
 */
export function getBottomNavAriaAttributes(): BottomNavAriaAttributes {
  return {
    role: "navigation",
    "aria-label": getBottomNavAriaLabel(),
  };
}

/**
 * Retorna la etiqueta de accesibilidad ARIA para el esqueleto de carga de la navegación principal.
 */
export function getBottomNavSkeletonAriaLabel(): string {
  return "Cargando navegación principal de Padel Red";
}

/**
 * Retorna la etiqueta ARIA de accesibilidad para el esqueleto de carga del catálogo de componentes.
 */
export function getCatalogSkeletonAriaLabel(): string {
  return "Cargando catálogo de componentes de Padel Red";
}

/**
 * Genera las clases CSS para el contenedor exterior del esqueleto de carga del catálogo.
 */
export function getCatalogSkeletonContainerClasses(
  customClassName?: string,
): string {
  return cn("min-h-screen bg-background p-6", customClassName);
}

/**
 * Genera las clases CSS para la maquetación flex de dos columnas del esqueleto del catálogo.
 */
export function getCatalogSkeletonLayoutClasses(
  customClassName?: string,
): string {
  return cn("mx-auto flex gap-12 max-w-none", customClassName);
}

/**
 * Genera las clases CSS para la barra lateral (sidebar) del esqueleto del catálogo en pantallas de escritorio.
 */
export function getCatalogSkeletonSidebarClasses(
  customClassName?: string,
): string {
  return cn("w-64 shrink-0 hidden lg:block", customClassName);
}

/**
 * Genera las clases CSS para el contenedor sticky de la barra lateral en el esqueleto del catálogo.
 */
export function getCatalogSkeletonSidebarStickyClasses(
  customClassName?: string,
): string {
  return cn("sticky top-6 space-y-6", customClassName);
}

/**
 * Genera las clases CSS para el área de contenido principal en el esqueleto del catálogo.
 */
export function getCatalogSkeletonMainContentClasses(
  customClassName?: string,
): string {
  return cn("flex-1 min-w-0", customClassName);
}

/**
 * Genera las clases CSS para el encabezado del área principal en el esqueleto del catálogo.
 */
export function getCatalogSkeletonHeaderClasses(
  customClassName?: string,
): string {
  return cn("mb-12 space-y-2", customClassName);
}

/**
 * Genera las clases CSS para las tarjetas de sección en el esqueleto del catálogo.
 */
export function getCatalogSkeletonSectionCardClasses(
  customClassName?: string,
): string {
  return cn(
    "p-6 border border-border rounded-xl bg-card space-y-2",
    customClassName,
  );
}

/**
 * Genera las clases CSS para los títulos de encabezado de la barra lateral en el esqueleto del catálogo.
 */
export function getCatalogSkeletonSidebarHeadingTitleClasses(
  customClassName?: string,
): string {
  return cn("h-4 w-12", customClassName);
}

/**
 * Genera las clases CSS para las pestañas de la barra lateral en el esqueleto del catálogo.
 */
export function getCatalogSkeletonSidebarTabButtonClasses(
  customClassName?: string,
): string {
  return cn("h-8 flex-1 rounded-lg", customClassName);
}

/**
 * Genera las clases CSS para el contenedor del listado de ítems de la barra lateral en el esqueleto del catálogo.
 */
export function getCatalogSkeletonSidebarItemListClasses(
  customClassName?: string,
): string {
  return cn("space-y-2", customClassName);
}

/**
 * Genera las clases CSS para cada ítem de la barra lateral en el esqueleto del catálogo.
 */
export function getCatalogSkeletonSidebarItemClasses(
  customClassName?: string,
): string {
  return cn("h-9 w-full rounded-lg", customClassName);
}

/**
 * Genera las clases CSS para el título principal del encabezado en el esqueleto del catálogo.
 */
export function getCatalogSkeletonHeaderTitleClasses(
  customClassName?: string,
): string {
  return cn("h-7 w-64", customClassName);
}

/**
 * Genera las clases CSS para el subtítulo del encabezado en el esqueleto del catálogo.
 */
export function getCatalogSkeletonHeaderSubtitleClasses(
  customClassName?: string,
): string {
  return cn("h-4 w-96", customClassName);
}

/**
 * Genera las clases CSS para los títulos de sección en el esqueleto del catálogo.
 */
export function getCatalogSkeletonSectionTitleClasses(
  customClassName?: string,
): string {
  return cn("h-5 w-32", customClassName);
}

/**
 * Genera las clases CSS para el esqueleto del campo de entrada de texto en el catálogo.
 */
export function getCatalogSkeletonInputClasses(
  customClassName?: string,
): string {
  return cn("h-12 w-full rounded-lg", customClassName);
}

/**
 * Genera las clases CSS para el esqueleto del botón en el catálogo.
 */
export function getCatalogSkeletonButtonClasses(
  customClassName?: string,
): string {
  return cn("h-10 w-full rounded-lg", customClassName);
}

/**
 * Genera las clases CSS para el grupo de chips/badges en el esqueleto del catálogo.
 */
export function getCatalogSkeletonChipGroupClasses(
  customClassName?: string,
): string {
  return cn("flex gap-2", customClassName);
}

/**
 * Genera las clases CSS para cada chip/badge en el esqueleto del catálogo.
 */
export function getCatalogSkeletonChipClasses(
  customClassName?: string,
): string {
  return cn("h-6 w-16 rounded-full", customClassName);
}

/**
 * Genera las clases CSS para cada tarjeta de elemento en la lista del esqueleto del catálogo.
 */
export function getCatalogSkeletonCardItemClasses(
  customClassName?: string,
): string {
  return cn("h-16 w-full rounded-xl", customClassName);
}

/**
 * Genera las clases CSS para una sección contenedora de la barra lateral en el esqueleto del catálogo.
 */
export function getCatalogSkeletonSidebarSectionClasses(
  customClassName?: string,
): string {
  return cn("space-y-3", customClassName);
}

/**
 * Genera las clases CSS para el contenedor de pestañas en la barra lateral del esqueleto del catálogo.
 */
export function getCatalogSkeletonSidebarTabContainerClasses(
  customClassName?: string,
): string {
  return cn("flex bg-muted rounded-xl p-1 border border-border", customClassName);
}

/**
 * Genera las clases CSS para la lista de secciones de contenido principal en el esqueleto del catálogo.
 */
export function getCatalogSkeletonMainContentListClasses(
  customClassName?: string,
): string {
  return cn("space-y-16 max-w-sm mx-auto lg:max-w-none", customClassName);
}

/**
 * Genera las clases CSS para un grupo de sección de contenido en el esqueleto del catálogo.
 */
export function getCatalogSkeletonSectionGroupClasses(
  customClassName?: string,
): string {
  return cn("space-y-6", customClassName);
}

/**
 * Genera las clases CSS para una tarjeta de sección amplia en el esqueleto del catálogo.
 */
export function getCatalogSkeletonCardSectionClasses(
  customClassName?: string,
): string {
  return cn(
    "p-6 border border-border rounded-xl bg-card space-y-6",
    customClassName,
  );
}

/**
 * Genera las clases CSS para una tarjeta de sección de lista en el esqueleto del catálogo.
 */
export function getCatalogSkeletonCardListClasses(
  customClassName?: string,
): string {
  return cn(
    "p-6 border border-border rounded-xl bg-card space-y-4",
    customClassName,
  );
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

/**
 * Genera las clases CSS para el contenedor exterior de la barra de navegación o su esqueleto.
 * Maneja posicionamiento fijo en la parte inferior con margen seguro para iOS/Android (safe area) o estático.
 */
export function getBottomNavContainerClasses(
  position: "fixed" | "static" = "fixed",
  customClassName?: string,
): string {
  return cn(
    "mx-auto flex w-full justify-center",
    position === "fixed" &&
      "fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom,0px)]",
    customClassName,
  );
}

/**
 * Genera los atributos ARIA accesibles para el esqueleto de carga de la navegación principal.
 */
export function getBottomNavSkeletonAriaAttributes(): BottomNavSkeletonAriaAttributes {
  return {
    role: "status",
    "aria-busy": "true",
    "aria-label": getBottomNavSkeletonAriaLabel(),
  };
}

/**
 * Genera las clases CSS para el ícono de pestaña en el esqueleto de carga de la barra de navegación.
 */
export function getBottomNavTabIconSkeletonClasses(customClassName?: string): string {
  return cn("h-5 w-5 rounded-md", customClassName);
}

/**
 * Genera las clases CSS para la etiqueta de texto de pestaña en el esqueleto de carga de la barra de navegación.
 */
export function getBottomNavTabLabelSkeletonClasses(customClassName?: string): string {
  return cn("h-3 w-10 rounded-sm", customClassName);
}

/**
 * Genera las clases CSS para el ícono central FAB en el esqueleto de carga de la barra de navegación.
 */
export function getBottomNavFabIconSkeletonClasses(customClassName?: string): string {
  return cn("h-6 w-6 rounded-md", customClassName);
}

/**
 * Genera las clases CSS para los íconos de los enlaces de navegación principales.
 */
export function getBottomNavIconClasses(customClassName?: string): string {
  return cn("h-5 w-5", customClassName);
}

/**
 * Genera las clases CSS para las etiquetas de texto de los enlaces de navegación principales.
 */
export function getBottomNavLabelClasses(customClassName?: string): string {
  return cn("mt-1 text-xs font-semibold", customClassName);
}

/**
 * Genera las clases CSS para el ícono Plus dentro del botón de acción flotante central (FAB).
 */
export function getFabIconClasses(customClassName?: string): string {
  return cn("h-6 w-6", customClassName);
}

/**
 * Genera las clases CSS para el contenedor flex interior de la barra de navegación o su esqueleto.
 */
export function getBottomNavInnerContainerClasses(customClassName?: string): string {
  return cn(
    "relative flex h-16 w-full items-stretch justify-evenly border-t border-border bg-background",
    customClassName,
  );
}

export interface BottomNavSkeletonTabsConfig {
  leftTabs: number[];
  rightTabs: number[];
}

/**
 * Retorna la estructura y cantidad de pestañas del esqueleto de carga a la izquierda y derecha del FAB central.
 */
export function getBottomNavSkeletonTabsConfig(): BottomNavSkeletonTabsConfig {
  return {
    leftTabs: [1, 2],
    rightTabs: [3, 4],
  };
}

/**
 * Genera las clases CSS para las columnas de pestañas en el esqueleto de carga de la barra de navegación.
 */
export function getBottomNavTabSkeletonClasses(customClassName?: string): string {
  return cn(
    "flex flex-1 flex-col items-center justify-center gap-1",
    customClassName,
  );
}

/**
 * Genera las clases CSS para la columna individual de una pestaña en el esqueleto de carga de la barra de navegación.
 */
export function getBottomNavTabItemSkeletonClasses(customClassName?: string): string {
  return getBottomNavTabSkeletonClasses(customClassName);
}

/**
 * Genera las clases CSS para el contenedor del botón de acción central (FAB) en el esqueleto de carga.
 */
export function getBottomNavFabSkeletonClasses(customClassName?: string): string {
  return cn(
    "relative -mt-6 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted shadow-xs",
    customClassName,
  );
}

export interface NavItemLinkProps {
  href: string;
  prefetch: boolean;
  className: string;
  "aria-label": string;
  "aria-current"?: "page";
}

export interface FabLinkProps {
  href: string;
  prefetch: boolean;
  className: string;
  "aria-label": string;
}

export interface NotificationsBadgeLinkProps {
  href: string;
  prefetch: boolean;
  role: "status";
  "aria-live": "polite";
  "aria-label": string;
  className: string;
}

export interface PendingActionMatchDetailProps {
  detailUrl: string;
  label: string;
}

export interface NotificationsEmptyStateProps {
  title: string;
  description: string;
  actionText: string;
  actionHref: string;
}

/**
 * Retorna la etiqueta ARIA de accesibilidad para el contenedor de esqueleto de carga de notificaciones.
 */
export function getNotificationsSkeletonAriaLabel(): string {
  return "Cargando notificaciones y acciones pendientes";
}

/**
 * Retorna la etiqueta ARIA de accesibilidad para la región/sección principal de notificaciones.
 */
export function getNotificationsRegionAriaLabel(): string {
  return "Sección de notificaciones y acciones pendientes";
}

/**
 * Retorna el título principal para la vista de notificaciones.
 */
export function getNotificationsHeadingTitle(): string {
  return "Notificaciones";
}

/**
 * Retorna la descripción secundaria para la vista de notificaciones.
 */
export function getNotificationsHeadingDescription(): string {
  return "Confirmaciones y resultados pendientes.";
}

/**
 * Retorna el título de la sección de acciones pendientes.
 */
export function getNotificationsActionsTitle(): string {
  return "Acciones requeridas";
}

/**
 * Formatea la etiqueta ARIA para la insignia con la cantidad de acciones pendientes.
 */
export function getNotificationsActionsBadgeAriaLabel(count: number): string {
  if (count <= 0) return "";
  return count === 1
    ? "1 acción pendiente"
    : `${count} acciones pendientes`;
}

/**
 * Retorna las propiedades para el estado vacío (sin notificaciones ni acciones pendientes).
 */
export function getNotificationsEmptyStateProps(): NotificationsEmptyStateProps {
  return {
    title: "Todo al día",
    description: "No tenés acciones pendientes por ahora.",
    actionText: "Volver al inicio",
    actionHref: "/me",
  };
}

/**
 * Determina si la insignia/badge de notificaciones debe renderizarse.
 */
export function shouldRenderNotificationsBadge(count: number): boolean {
  return count > 0;
}

/**
 * Retorna las clases CSS para el contenedor principal de la aplicación en el AppLayout.
 */
export function getAppLayoutClasses(customClassName?: string): string {
  return cn("relative flex min-h-screen flex-col bg-background", customClassName);
}

/**
 * Retorna las clases CSS para la etiqueta <main> del contenido principal en el AppLayout.
 */
export function getAppMainClasses(customClassName?: string): string {
  return cn("flex-1 px-5 pt-4 pb-20", customClassName);
}

/**
 * Genera los atributos de accesibilidad ARIA para el contenedor principal de la aplicación.
 */
export function getAppLayoutAriaAttributes(): { role: string; "aria-label": string } {
  return {
    role: "region",
    "aria-label": "Aplicación Padel Red",
  };
}

/**
 * Genera los atributos de accesibilidad ARIA para el área principal de contenido (<main>).
 */
export function getAppMainAriaAttributes(): { role: string; "aria-label": string } {
  return {
    role: "main",
    "aria-label": "Contenido principal",
  };
}

/**
 * Genera las clases CSS para los enlaces de navegación principales.
 * Aplica tamaño táctil óptimo (mínimo 48px), foco por teclado accesible, respuesta táctil (active:scale) y resaltado activo.
 */
export function getNavItemClasses(
  isActive: boolean,
  customClassName?: string,
): string {
  return cn(
    "group relative flex flex-1 flex-col items-center justify-center transition-all duration-100 min-h-[48px]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-lg",
    "active:scale-[0.98]",
    isActive
      ? "text-primary"
      : "text-muted-foreground hover:text-foreground",
    customClassName,
  );
}

/**
 * Determina la URL de detalle y la etiqueta de acción para un partido con acciones pendientes.
 * Si el partido carece de marcador (score), redirige al formulario de resultado ("/match/[id]/result") con etiqueta "Cargar resultado".
 * De lo contrario, redirige a la vista del partido ("/match/[id]") con etiqueta "Confirmar".
 */
export function getPendingActionMatchDetailProps(match: {
  id: string;
  score?: unknown;
}): PendingActionMatchDetailProps {
  const needsScore = !match.score;
  return {
    detailUrl: needsScore
      ? `/match/${match.id}/result`
      : `/match/${match.id}`,
    label: needsScore ? "Cargar resultado" : "Confirmar",
  };
}

/**
 * Genera el objeto completo de propiedades para el componente Link del badge de notificaciones en la barra de navegación (BottomNav).
 */
export function getBottomNavNotificationsBadgeLinkProps(
  count: number,
  href: string = "/notifications",
  customClassName?: string,
): NotificationsBadgeLinkProps {
  const ariaAttrs = getNotificationsBadgeAriaAttributes(count);
  return {
    href,
    prefetch: true,
    ...ariaAttrs,
    className: getNotificationsBadgeClasses(customClassName),
  };
}

/**
 * Retorna las clases CSS para el contenedor superior de la vista de notificaciones.
 */
export function getNotificationsHeaderClasses(customClassName?: string): string {
  return cn("flex flex-col gap-6", customClassName);
}

/**
 * Retorna las clases CSS para el contenedor del esqueleto de carga de notificaciones.
 */
export function getNotificationsSkeletonContainerClasses(
  customClassName?: string,
): string {
  return cn("flex flex-col gap-6", customClassName);
}

/**
 * Retorna las clases CSS para el contenedor de la lista de notificaciones y acciones requeridas.
 */
export function getNotificationsContainerClasses(customClassName?: string): string {
  return cn("space-y-3", customClassName);
}

/**
 * Retorna las clases CSS para la insignia/badge numérica de la sección de acciones requeridas.
 */
export function getNotificationsActionsBadgeClasses(customClassName?: string): string {
  return cn(
    "rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground",
    customClassName,
  );
}

/**
 * Retorna las clases CSS para el listado de tarjetas de partidos con acciones pendientes.
 */
export function getNotificationsListClasses(customClassName?: string): string {
  return cn("space-y-2", customClassName);
}

/**
 * Retorna las clases CSS para el título principal de la vista de notificaciones.
 */
export function getNotificationsHeadingTitleClasses(customClassName?: string): string {
  return cn("text-xl font-bold text-foreground", customClassName);
}

/**
 * Retorna las clases CSS para la descripción secundaria de la vista de notificaciones.
 */
export function getNotificationsHeadingDescriptionClasses(customClassName?: string): string {
  return cn("text-sm text-muted-foreground", customClassName);
}

/**
 * Retorna las clases CSS para el encabezado de sección de acciones requeridas.
 */
export function getNotificationsSectionHeaderClasses(customClassName?: string): string {
  return cn("flex items-center gap-2", customClassName);
}

/**
 * Retorna las clases CSS para el título de la sección de acciones requeridas.
 */
export function getNotificationsSectionTitleClasses(customClassName?: string): string {
  return cn("text-sm font-bold text-foreground", customClassName);
}

/**
 * Retorna las clases CSS para el esqueleto del título de la vista de notificaciones.
 */
export function getNotificationsSkeletonHeadingTitleClasses(customClassName?: string): string {
  return cn("h-5 w-32", customClassName);
}

/**
 * Retorna las clases CSS para el esqueleto de la descripción de la vista de notificaciones.
 */
export function getNotificationsSkeletonHeadingSubtitleClasses(customClassName?: string): string {
  return cn("mt-1 h-4 w-48", customClassName);
}

/**
 * Retorna las clases CSS para el esqueleto de la insignia de acciones requeridas.
 */
export function getNotificationsSkeletonSectionBadgeClasses(customClassName?: string): string {
  return cn("h-5 w-8 rounded-md", customClassName);
}

/**
 * Retorna las clases CSS para cada tarjeta en el esqueleto de la lista de notificaciones.
 */
export function getNotificationsSkeletonItemClasses(customClassName?: string): string {
  return cn("h-16 w-full rounded-xl", customClassName);
}

/**
 * Genera las clases CSS para el título de la etiqueta de sección de la barra lateral en el esqueleto del catálogo.
 */
export function getCatalogSkeletonSidebarSectionLabelClasses(
  customClassName?: string,
): string {
  return cn("h-4 w-20", customClassName);
}

/**
 * Genera las clases CSS para el título de tarjeta de sección en el esqueleto del catálogo.
 */
export function getCatalogSkeletonCardTitleClasses(
  customClassName?: string,
): string {
  return cn("h-7 w-48", customClassName);
}

/**
 * Genera las clases CSS para el subtítulo de tarjeta de sección en el esqueleto del catálogo.
 */
export function getCatalogSkeletonCardSubtitleClasses(
  customClassName?: string,
): string {
  return cn("h-4 w-64", customClassName);
}

/**
 * Genera las clases CSS para el título de subsección secundaria en el esqueleto del catálogo.
 */
export function getCatalogSkeletonSubSectionTitleClasses(
  customClassName?: string,
): string {
  return cn("h-5 w-28", customClassName);
}

/**
 * Genera las clases CSS para la etiqueta pequeña de subsección en el esqueleto del catálogo.
 */
export function getCatalogSkeletonLabelClasses(
  customClassName?: string,
): string {
  return cn("h-4 w-16", customClassName);
}

/**
 * Genera las clases CSS para la variante de chip secundario en el esqueleto del catálogo.
 */
export function getCatalogSkeletonChipSecondaryClasses(
  customClassName?: string,
): string {
  return cn("h-6 w-20 rounded-full", customClassName);
}

/**
 * Retorna las clases CSS para el título de la sección de acciones requeridas en el esqueleto de notificaciones.
 */
export function getNotificationsSkeletonSectionTitleClasses(
  customClassName?: string,
): string {
  return cn("h-4 w-32", customClassName);
}

/**
 * Genera el objeto completo de propiedades para el enlace (<Link>) de un ítem de navegación principal.
 */
export function getNavItemLinkProps(
  item: NavItem,
  isActive: boolean,
  customClassName?: string,
): NavItemLinkProps {
  const ariaAttrs = getNavItemAriaAttributes(item, isActive);
  return {
    href: item.href,
    prefetch: true,
    className: getNavItemClasses(isActive, customClassName),
    ...ariaAttrs,
  };
}

/**
 * Genera el objeto completo de propiedades para el enlace (<Link>) del botón de acción flotante central (FAB).
 */
export function getFabLinkProps(
  customClassName?: string,
): FabLinkProps {
  const fabConfig = getFabItemConfig();
  const ariaAttrs = getFabAriaAttributes();
  return {
    href: fabConfig.href,
    prefetch: true,
    className: getFabClasses(customClassName),
    ...ariaAttrs,
  };
}

/**
 * Retorna la ruta de destino para el enlace de la insignia/badge flotante de notificaciones.
 */
export function getNotificationsBadgeHref(): string {
  return "/notifications";
}

/**
 * Genera el objeto completo de propiedades para el componente Link de la insignia/badge flotante de notificaciones.
 */
export function getNotificationsBadgeLinkProps(
  count: number,
  customClassName?: string,
): NotificationsBadgeLinkProps {
  const ariaAttrs = getNotificationsBadgeAriaAttributes(count);
  return {
    href: getNotificationsBadgeHref(),
    prefetch: true,
    ...ariaAttrs,
    className: getFloatingNotificationsBadgeClasses(customClassName),
  };
}

/**
 * Genera las clases CSS para el botón de acción flotante central (FAB).
 */
export function getFabClasses(customClassName?: string): string {
  return cn(
    "relative -mt-6 flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-all duration-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    customClassName,
  );
}

/**
 * Genera las clases CSS para la insignia/badge flotante de notificaciones pendientes (relativo al elemento padre).
 */
export function getNotificationsBadgeClasses(customClassName?: string): string {
  return cn(
    "absolute -top-3 right-6 flex h-7 min-w-[28px] items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground transition-all duration-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    customClassName,
  );
}

/**
 * Genera las clases CSS para la insignia/badge flotante fija de notificaciones pendientes (posicionamiento 'fixed').
 * Aplica elevación por encima de la barra inferior con margen seguro para dispositivos móviles (safe-area-inset-bottom).
 */
export function getFloatingNotificationsBadgeClasses(customClassName?: string): string {
  return cn(
    "fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+12px)] right-6 z-50 flex h-7 min-w-[28px] items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground shadow-md transition-all duration-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    customClassName,
  );
}
