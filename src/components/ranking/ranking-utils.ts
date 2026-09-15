/**
 * Pure helper functions for Ranking UI components accessibility and formatting
 */

/**
 * Returns accessible ARIA label for toggling ranking rules disclosure
 */
export function getRankingRulesAriaLabel(isOpen: boolean): string {
  return isOpen
    ? "Ocultar reglas y fórmulas del ranking de Padel Red"
    : "Mostrar reglas y fórmulas del ranking de Padel Red";
}

/**
 * Returns accessible ARIA label for ranking filter tabs
 */
export function getRankingFilterTabAriaLabel(
  tab: "activos" | "todos",
  playerCount?: number
): string {
  if (tab === "activos") {
    return playerCount !== undefined
      ? `Mostrar jugadores activos únicamente (${playerCount} registrados)`
      : "Mostrar jugadores activos únicamente";
  }
  return playerCount !== undefined
    ? `Mostrar todos los jugadores registrados (${playerCount} en total)`
    : "Mostrar todos los jugadores registrados";
}

/**
 * Returns dynamic ARIA status description for search state and query
 */
export function getRankingSearchStatusAriaLabel(
  isPending: boolean,
  query: string,
  resultCount?: number
): string {
  if (isPending) {
    return "Buscando jugadores en el ranking...";
  }
  if (!query) {
    return "Búsqueda lista";
  }
  if (resultCount !== undefined) {
    return resultCount === 1
      ? `Se encontró 1 jugador para "${query}"`
      : `Se encontraron ${resultCount} jugadores para "${query}"`;
  }
  return `Filtrando por "${query}"`;
}

/**
 * Returns accessible ARIA region landmark label for ranking section
 */
export function getRankingRegionAriaLabel(
  section: "rules" | "search" | "filter"
): string {
  switch (section) {
    case "rules":
      return "Reglas y fórmulas del ranking de Padel Red";
    case "search":
      return "Buscador de jugadores por nombre o alias";
    case "filter":
      return "Clasificación general y podio de jugadores";
  }
}
