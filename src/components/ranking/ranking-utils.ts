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
 * Returns accessible ARIA label for podium player cards
 */
export function getPodiumPlayerAriaLabel(
  positionRank: 1 | 2 | 3,
  playerName: string,
  isViewer: boolean,
  rankingScore: number,
  rankingDelta?: number | null
): string {
  const ordinal = positionRank === 1 ? "1ra" : positionRank === 2 ? "2da" : "3ra";
  const nameLabel = isViewer ? "Vos" : playerName;
  const scoreLabel = `${Math.round(rankingScore)} puntos`;

  let deltaLabel = "sin cambios";
  if (rankingDelta && rankingDelta > 0) {
    deltaLabel = `subió ${rankingDelta}`;
  } else if (rankingDelta && rankingDelta < 0) {
    deltaLabel = `bajó ${Math.abs(rankingDelta)}`;
  }

  return `${ordinal} posición: ${nameLabel}, ${scoreLabel}. Cambio de posición: ${deltaLabel}.`;
}

/**
 * Returns accessible ARIA label for ranking list items
 */
export function getRankingListItemAriaLabel(
  positionNum: number,
  playerName: string,
  isViewer: boolean,
  rankingScore: number,
  wins: number,
  losses: number,
  rankingDelta?: number | null
): string {
  const nameLabel = isViewer ? "Vos" : playerName;
  const roundedScore = Math.round(rankingScore);

  let deltaText = "sin cambios";
  if (rankingDelta && rankingDelta > 0) {
    deltaText = `subió ${rankingDelta}`;
  } else if (rankingDelta && rankingDelta < 0) {
    deltaText = `bajó ${Math.abs(rankingDelta)}`;
  }

  return `Posición ${positionNum}: ${nameLabel}, ${roundedScore} puntos. ${wins} victorias, ${losses} derrotas. Cambio de posición: ${deltaText}.`;
}

/**
 * Returns text / accessible ARIA label for ranking breakdown toggle button
 */
export function getRankingBreakdownButtonAriaLabel(
  isOpen: boolean,
  isPending: boolean
): string {
  if (isPending) {
    return "Cargando desglose de puntos...";
  }
  return isOpen
    ? "Ocultar desglose de puntos 📊"
    : "Ver desglose de puntos 📊";
}

/**
 * Returns accessible ARIA label for user ranking summary banner or card
 */
export function getRankingUserSummaryAriaLabel(
  isBanner: boolean,
  position: number | null,
  score: number,
  winRate: number,
  reputationPercent: number,
  wins: number,
  losses: number,
  delta?: number | null
): string {
  const contextLabel = isBanner ? "Resumen de tu ranking" : "Tarjeta de mi posición";
  const posText = position ? `Posición #${position}` : "Sin posición asignada";
  const pointsText = `${Math.round(score)} puntos`;
  const recordText = `${wins} victorias, ${losses} derrotas (${winRate}% de victorias)`;
  const repText = `${reputationPercent}% de reputación`;

  let deltaText = "sin cambios";
  if (delta && delta > 0) {
    deltaText = `subió ${delta} lugares`;
  } else if (delta && delta < 0) {
    deltaText = `bajó ${Math.abs(delta)} lugares`;
  }

  return `${contextLabel}: ${posText}, ${pointsText}. ${recordText}. ${repText}. Cambio: ${deltaText}.`;
}

/**
 * Returns localized count description for pending match confirmations
 */
export function getPendingConfirmationsCountText(count: number): string {
  if (count <= 0) return "No tenés partidos pendientes de confirmación.";
  const matchText = count === 1 ? "1 partido pendiente" : `${count} partidos pendientes`;
  return `Tenés ${matchText}. Confirmá para actualizar el ranking.`;
}

/**
 * Formats match date for pending confirmations alert
 */
export function formatPendingMatchDate(
  dateValue: Date | string | undefined,
  mounted: boolean
): string {
  if (!mounted || !dateValue) return "";
  const matchDate = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (isNaN(matchDate.getTime())) return "";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(matchDate);
}

/**
 * Returns accessible ARIA label for confirming match result
 */
export function getPendingMatchConfirmAriaLabel(
  score: string | null | undefined,
  formattedDate: string
): string {
  const dateSuffix = formattedDate ? ` para el partido del ${formattedDate}` : "";
  const scoreText = score ? ` ${score}` : "";
  return `Confirmar resultado${scoreText}${dateSuffix}`;
}

/**
 * Returns accessible ARIA label for loading match result page
 */
export function getPendingMatchResultAriaLabel(formattedDate: string): string {
  const dateSuffix = formattedDate ? ` para el partido del ${formattedDate}` : "";
  return `Cargar resultado${dateSuffix}`;
}

/**
 * Returns accessible ARIA label for viewing match details
 */
export function getPendingMatchDetailAriaLabel(formattedDate: string): string {
  const dateSuffix = formattedDate ? ` del partido del ${formattedDate}` : " del partido";
  return `Ver detalle${dateSuffix}`;
}

/**
 * Returns accessible ARIA region landmark label for ranking section
 */
export function getRankingRegionAriaLabel(
  section:
    | "rules"
    | "rules-detail"
    | "search"
    | "filter"
    | "podium"
    | "list"
    | "breakdown"
    | "banner"
    | "card"
    | "pending"
): string {
  switch (section) {
    case "rules":
      return "Reglas y fórmulas del ranking de Padel Red";
    case "rules-detail":
      return "Detalle de reglas y fórmulas del ranking";
    case "search":
      return "Buscador de jugadores por nombre o alias";
    case "filter":
      return "Clasificación general y podio de jugadores";
    case "podium":
      return "Podio de los 3 mejores jugadores del ranking";
    case "list":
      return "Listado de clasificación general de jugadores";
    case "breakdown":
      return "Desglose detallado de puntos de ranking";
    case "banner":
      return "Resumen de ranking de usuario";
    case "card":
      return "Tarjeta de posición y puntos de ranking";
    case "pending":
      return "Alertas de partidos pendientes de confirmación";
  }
}
