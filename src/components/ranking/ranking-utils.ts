import { cn, capitalizeName } from "@/lib/utils";

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
 * Returns heading title text for ranking rules section
 */
export function getRankingRulesHeaderTitle(): string {
  return "Reglas y Fórmulas del Ranking";
}

/**
 * Returns heading subtitle text for ranking rules section
 */
export function getRankingRulesHeaderSubtitle(): string {
  return "¿Cómo se calculan los puntos y posiciones?";
}

/**
 * Returns section title text for ranking rules breakdown items
 */
export function getRankingRulesSectionTitle(
  section: "points" | "penalties" | "decay" | "tiebreak"
): string {
  switch (section) {
    case "points":
      return "Cálculo de Puntos";
    case "penalties":
      return "Penalizaciones por Asistencia";
    case "decay":
      return "Decay por Inactividad";
    case "tiebreak":
      return "Criterios de Desempate";
  }
}

/**
 * Returns mathematical formula display text for ranking score
 */
export function getRankingFormulaText(): string {
  return "Puntos = 1000 + (Victorias × 15) + (Racha × 5) + (Bonus de Sets) - Penalizaciones";
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
 * Returns accessible ARIA label for ranking search input field
 */
export function getRankingSearchInputAriaLabel(): string {
  return "Buscar jugadores por nombre o alias";
}

/**
 * Returns accessible ARIA label for clearing ranking search query
 */
export function getRankingSearchClearAriaLabel(): string {
  return "Limpiar búsqueda";
}

/**
 * Returns placeholder text for ranking search input
 */
export function getRankingSearchPlaceholder(): string {
  return "Buscar jugador o alias...";
}

/**
 * Returns heading title text for ranking page
 */
export function getRankingHeadingTitle(): string {
  return "Ranking";
}

/**
 * Returns heading description text for ranking page
 */
export function getRankingHeadingDescription(): string {
  return "Posiciones según resultados confirmados.";
}

/**
 * Returns accessible ARIA label for ranking loading skeleton state
 */
export function getRankingSkeletonAriaLabel(): string {
  return "Cargando clasificación y estadísticas de ranking...";
}

/**
 * Returns title text for ranking filter empty state
 */
export function getRankingFilterEmptyTitle(query?: string): string {
  return query ? "No se encontraron jugadores" : "Sin jugadores";
}

/**
 * Returns description text for ranking filter empty state
 */
export function getRankingFilterEmptyDescription(query?: string): string {
  return query
    ? `No hay resultados para "${query}".`
    : "Aún no hay jugadores registrados.";
}

/**
 * Returns accessible ARIA label for clearing search from empty state action
 */
export function getRankingFilterClearAriaLabel(): string {
  return "Limpiar búsqueda y volver a la clasificación general";
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
    | "skeleton"
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
    case "skeleton":
      return "Cargando clasificación y estadísticas de ranking...";
  }
}

/**
 * Returns accessible title text for win streak badges
 */
export function getWinStreakTitle(streak: number): string {
  if (streak <= 0) return "";
  return streak === 1 ? "Racha de 1 victoria" : `Racha de ${streak} victorias`;
}

/**
 * Returns accessible title text for ranking delta changes
 */
export function getDeltaChangeTitle(delta: number): string {
  if (delta > 0) {
    return delta === 1 ? "Subió 1 posición" : `Subió ${delta} posiciones`;
  }
  if (delta < 0) {
    const absDelta = Math.abs(delta);
    return absDelta === 1 ? "Bajó 1 posición" : `Bajó ${absDelta} posiciones`;
  }
  return "Sin cambios de posición";
}

/**
 * Returns formatted descriptive text for ranking score breakdown items
 */
export function getRankingBreakdownItemLabel(
  item: "base" | "wins" | "streak" | "sets" | "late" | "noShow" | "decay" | "final",
  value?: number
): string {
  switch (item) {
    case "base":
      return "Puntos base iniciales";
    case "wins":
      return value !== undefined ? `Victorias (${value})` : "Victorias";
    case "streak":
      return value !== undefined ? `Racha actual (${value} 🔥)` : "Racha actual";
    case "sets":
      return "Bonus por sets ganados";
    case "late":
      return value !== undefined ? `Llegadas tarde (${value})` : "Llegadas tarde";
    case "noShow":
      return value !== undefined ? `Ausencias sin aviso (${value})` : "Ausencias sin aviso";
    case "decay":
      return "Decay por inactividad";
    case "final":
      return "Puntaje recalculado";
  }
}

/**
 * Returns heading label text for user ranking stat cards and banners
 */
export function getRankingStatLabel(
  stat: "position" | "myPosition" | "points" | "winRate" | "reputation"
): string {
  switch (stat) {
    case "position":
      return "Tu posición";
    case "myPosition":
      return "Mi posición";
    case "points":
      return "Puntos";
    case "winRate":
      return "WR";
    case "reputation":
      return "Rep";
  }
}

/**
 * Returns title text for pending confirmations alert header
 */
export function getPendingConfirmationsTitle(): string {
  return "Confirmaciones pendientes";
}

/**
 * Returns success toast message for confirming match result
 */
export function getPendingMatchConfirmSuccessToast(): string {
  return "Confirmaste el resultado. 🏆";
}

/**
 * Returns error toast message when match result confirmation fails
 */
export function getPendingMatchConfirmErrorToast(message?: string | null): string {
  return message || "No se pudo confirmar el resultado.";
}

/**
 * Returns error toast message when match result confirmation throws an exception
 */
export function getPendingMatchConfirmExceptionToast(): string {
  return "Ocurrió un error al procesar la confirmación.";
}

/**
 * Returns prefix text for loaded match result in pending confirmations
 */
export function getPendingMatchScoreLoadedLabel(): string {
  return "Resultado cargado:";
}

/**
 * Returns text when match result is pending in pending confirmations
 */
export function getPendingMatchScorePendingText(): string {
  return "Pendiente de cargar resultado";
}

/**
 * Returns button text for confirming pending match result
 */
export function getPendingMatchConfirmButtonText(): string {
  return "Confirmar";
}

/**
 * Returns button text for navigating to load pending match result
 */
export function getPendingMatchResultButtonText(): string {
  return "Cargar resultado";
}

/**
 * Returns label text for ranking filter tab buttons ("Activos" | "Todos")
 */
export function getRankingFilterTabLabel(tab: "activos" | "todos"): string {
  return tab === "activos" ? "Activos" : "Todos";
}

/**
 * Returns accessible ARIA label for ranking filter radiogroup
 */
export function getRankingFilterTabsGroupAriaLabel(): string {
  return "Filtrar clasificación";
}

/**
 * Returns clear search button text in ranking filter empty state
 */
export function getRankingFilterClearButtonText(): string {
  return "Limpiar búsqueda";
}

/**
 * Returns error message text for ranking breakdown loading failures
 */
export function getRankingBreakdownErrorText(message?: string | null): string {
  return message || "Error al cargar el desglose.";
}

/**
 * Formats ranking position text (e.g. "#1", "S/P", "--")
 */
export function formatRankingPositionText(
  position: number | null | undefined,
  fallback = "S/P"
): string {
  return position ? `#${position}` : fallback;
}

/**
 * Formats match record text (e.g. "8V-2D")
 */
export function formatMatchRecordText(wins: number, losses: number): string {
  return `${wins}V-${losses}D`;
}

/**
 * Returns heading title text for ranking podium section ("Podio")
 */
export function getPodiumHeadingTitle(): string {
  return "Podio";
}

/**
 * Returns badge title text for reliable players with high attendance score
 */
export function getReliablePlayerBadgeTitle(): string {
  return "Jugador confiable";
}

/**
 * Formats recent form title string for tooltips and screen readers
 */
export function formatRecentFormTitle(recentForm: ("W" | "L")[]): string {
  if (!recentForm || recentForm.length === 0) return "";
  const formStr = recentForm.map((r) => (r === "W" ? "G" : "P")).join(", ");
  return `Forma reciente: ${formStr}`;
}

/**
 * Returns capitalized display name or alias or fallback for a player
 */
export function getRankingPlayerDisplayName(
  displayName?: string | null,
  alias?: string | null,
  fallback = "Jugador"
): string {
  return capitalizeName(displayName ?? alias ?? fallback);
}

/**
 * Returns Tailwind class names for RankingListItem container
 */
export function getRankingListItemContainerClasses(isViewer: boolean): string {
  return cn(
    "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all active:scale-[0.98] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    isViewer ? "border-primary font-semibold shadow-sm bg-card" : "border-border bg-card"
  );
}

/**
 * Returns Tailwind class names for RankingListItem position badge
 */
export function getRankingListItemPositionClasses(isViewer: boolean): string {
  return cn(
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums",
    isViewer ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
  );
}

/**
 * Returns Tailwind class names for RankingListItem player name
 */
export function getRankingListItemNameClasses(isViewer: boolean): string {
  return cn(
    "text-sm font-bold truncate",
    isViewer ? "text-primary" : "text-foreground"
  );
}

/**
 * Returns Tailwind class names for recent form dot indicators
 */
export function getRecentFormDotClasses(result: "W" | "L" | string): string {
  return cn(
    "h-1.5 w-1.5 rounded-full",
    result === "W" ? "bg-emerald-500" : "bg-rose-500"
  );
}

/**
 * Returns Tailwind class names for podium player card containers
 */
export function getPodiumContainerClasses(
  positionRank: 1 | 2 | 3,
  isViewer: boolean
): string {
  if (positionRank === 1) {
    return "flex flex-col items-center gap-2 rounded-xl border border-primary font-semibold shadow-xs bg-card p-3 transition-all active:scale-[0.98] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
  }
  return cn(
    "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all active:scale-[0.98] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    isViewer ? "border-primary font-semibold shadow-xs bg-card" : "border-border bg-card"
  );
}

/**
 * Returns Tailwind class names for podium player avatar border
 */
export function getPodiumAvatarClasses(
  positionRank: 1 | 2 | 3,
  isViewer: boolean
): string {
  if (positionRank === 1) {
    return "border-2 border-primary";
  }
  return cn("border-2", isViewer ? "border-primary" : "border-muted");
}

/**
 * Returns Tailwind class names for podium position rank badge
 */
export function getPodiumBadgeClasses(positionRank: 1 | 2 | 3): string {
  if (positionRank === 1) {
    return "absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground border-2 border-background";
  }
  return "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground border-2 border-card";
}

/**
 * Returns Tailwind class names for podium player name text
 */
export function getPodiumPlayerNameClasses(
  positionRank: 1 | 2 | 3,
  isViewer: boolean
): string {
  if (positionRank === 1) {
    return cn(
      "text-xs font-bold truncate w-full text-center flex items-center justify-center gap-0.5",
      isViewer ? "text-primary" : "text-foreground"
    );
  }
  return cn(
    "text-xs truncate w-full text-center flex items-center justify-center gap-0.5",
    isViewer ? "text-primary font-bold" : "font-semibold text-foreground"
  );
}

/**
 * Returns Tailwind class names for ranking position delta indicator
 */
export function getRankingDeltaClasses(delta: number): string {
  if (delta > 0) {
    return "flex items-center gap-0.5 text-xs text-primary";
  }
  if (delta < 0) {
    return "flex items-center gap-0.5 text-xs text-muted-foreground";
  }
  return "flex items-center gap-0.5 text-xs text-muted-foreground/50";
}

/**
 * Returns Tailwind class names for ranking filter radiogroup container
 */
export function getRankingFilterRadiogroupClasses(): string {
  return "grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl shadow-xs";
}

/**
 * Returns Tailwind class names for ranking filter tab buttons
 */
export function getRankingFilterTabButtonClasses(isActive: boolean): string {
  return cn(
    "flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    isActive
      ? "bg-card border border-border text-foreground shadow-xs"
      : "border-transparent text-muted-foreground hover:bg-card hover:text-foreground"
  );
}

/**
 * Returns Tailwind class names for ranking search container
 */
export function getRankingSearchContainerClasses(): string {
  return "relative group";
}

/**
 * Returns Tailwind class names for ranking search input field
 */
export function getRankingSearchInputClasses(): string {
  return "h-12 pl-11 pr-11 rounded-xl bg-card border-border placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background transition-colors shadow-xs [&::-webkit-search-cancel-button]:hidden";
}

/**
 * Returns Tailwind class names for ranking search clear button
 */
export function getRankingSearchClearButtonClasses(): string {
  return "absolute inset-y-0 right-3.5 my-auto h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-all active:scale-[0.98] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Returns Tailwind class names for ranking breakdown toggle button
 */
export function getRankingBreakdownButtonClasses(): string {
  return "w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-primary bg-muted rounded-lg border border-border hover:bg-muted/80 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Returns Tailwind class names for ranking breakdown details container
 */
export function getRankingBreakdownContainerClasses(): string {
  return "mt-3 p-3 rounded-lg bg-muted border border-border space-y-2.5 text-xs";
}

/**
 * Returns Tailwind class names for ranking decay banner container
 */
export function getRankingDecayBannerClasses(): string {
  return "mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted -mx-4 -mb-4 p-3 rounded-b-xl border-t-0";
}

/**
 * Returns Tailwind class names for ranking info container
 */
export function getRankingInfoContainerClasses(): string {
  return "rounded-xl border border-border bg-card overflow-hidden transition-all shadow-xs";
}

/**
 * Returns Tailwind class names for ranking info toggle button
 */
export function getRankingInfoHeaderButtonClasses(): string {
  return "w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Returns Tailwind class names for pending confirmations alert container
 */
export function getPendingConfirmationsContainerClasses(): string {
  return "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs";
}

/**
 * Returns Tailwind class names for individual pending confirmation item card
 */
export function getPendingConfirmationsItemClasses(): string {
  return "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-muted p-3 shadow-xs";
}

/**
 * Returns Tailwind class names for pending match confirm result action button
 */
export function getPendingMatchConfirmButtonClasses(): string {
  return "flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:opacity-50";
}

/**
 * Returns Tailwind class names for pending match load result navigation button/link
 */
export function getPendingMatchResultButtonClasses(): string {
  return "flex h-9 items-center justify-center gap-1 rounded-lg border border-border bg-card px-3 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Returns Tailwind class names for pending match view detail navigation button/link
 */
export function getPendingMatchDetailButtonClasses(): string {
  return "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}
