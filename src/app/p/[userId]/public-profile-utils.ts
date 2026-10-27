import { cn, getMatchWinner } from "@/lib/utils";

export type RecentFormResult = "W" | "L";

export interface MatchWithScoreAndPlayers {
  score: string | null;
  players: {
    userId?: string | null;
    position: number;
  }[];
}

export function calculateRecentForm(
  matches: MatchWithScoreAndPlayers[],
  userId: string,
): RecentFormResult[] {
  return matches.map((match) => {
    if (!match.score) return "L";
    const winner = getMatchWinner(match.score);
    if (!winner) return "L";

    const playerPosition =
      match.players.find((p) => p.userId === userId)?.position ?? 0;
    const playerTeam = playerPosition < 2 ? "A" : "B";

    return winner === playerTeam ? "W" : "L";
  });
}

export function getRecentFormAriaLabel(recentForm: RecentFormResult[]): string {
  if (recentForm.length === 0) {
    return "Sin partidos";
  }

  const formattedResults = recentForm
    .map((r) => (r === "W" ? "G" : "P"))
    .join(", ");

  return `Forma reciente: ${formattedResults}`;
}

export function getStreakBadgeText(streak: number): string {
  const victoriasText = streak === 1 ? "Victoria" : "Victorias";
  return `Racha: ${streak} ${victoriasText} 🔥`;
}

export function getWinRateAriaLabel(winRate: number, matchesPlayed: number): string {
  if (matchesPlayed === 0) {
    return "Efectividad: 0% en 0 partidos";
  }

  const partidosText = matchesPlayed === 1 ? "partido" : "partidos";
  return `Efectividad: ${winRate}% en ${matchesPlayed} ${partidosText}`;
}

export function getPublicProfileSideLabel(
  side: "RIGHT" | "LEFT" | "BOTH" | null,
): string {
  if (side === "RIGHT") return "Derecha";
  if (side === "LEFT") return "Revés";
  return "Alterno";
}

export function formatSideWinRateSummary(
  winRateRight: number | null,
  winRateLeft: number | null,
): string {
  const parts: string[] = [];

  if (winRateRight !== null) {
    parts.push(`Der: ${Math.round(winRateRight * 100)}% WR`);
  }

  if (winRateLeft !== null) {
    parts.push(`Rev: ${Math.round(winRateLeft * 100)}% WR`);
  }

  if (parts.length === 0) {
    return "Sin partidos";
  }

  return parts.join(" ");
}

export function calculateWinningStreak(recentForm: RecentFormResult[]): number {
  let streak = 0;
  for (const result of recentForm) {
    if (result === "W") {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function formatPartnerWinsText(wins: number): string {
  const label = wins === 1 ? "victoria" : "victorias";
  return `${wins} ${label} 🔥`;
}

export function formatRivalMatchesText(matches: number): string {
  const label = matches === 1 ? "partido" : "partidos";
  return `${matches} ${label} ⚔️`;
}

export function getPublicProfileBackAriaLabel(): string {
  return "Volver atrás";
}

export function getPublicProfileHeaderAriaLabel(displayName?: string | null): string {
  const name = displayName?.trim() || "Jugador";
  return `Perfil y estadísticas de ${name}`;
}

export function getPublicProfileShareTitle(displayName?: string | null): string {
  const name = displayName?.trim() || "Jugador";
  return `Perfil de ${name}`;
}

export function getPublicProfileShareText(displayName?: string | null): string {
  const name = displayName?.trim() || "Jugador";
  return `Mirá las estadísticas de ${name} en Padel Red.`;
}

export function getNetworkPositionRegionAriaLabel(): string {
  return "Estadísticas de red y posición";
}

export function formatNetworkContactsCountText(count: number): string {
  const label = count === 1 ? "jugador" : "jugadores";
  return `${count} ${label}`;
}

export function getHeadToHeadRegionAriaLabel(): string {
  return "Estadísticas cara a cara";
}

export function formatH2HLastMatchResultText(
  isViewerWinner: boolean,
  score: string | null,
): string {
  const outcome = isViewerWinner ? "Victoria" : "Derrota";
  return score ? `${outcome} • ${score}` : outcome;
}

export function getMatchHistoryRegionAriaLabel(): string {
  return "Historial reciente de partidos";
}

export function getPublicProfileSkeletonAriaLabel(): string {
  return "Cargando perfil público y estadísticas de jugador";
}

export function getPublicProfileHeaderTitle(): string {
  return "Perfil Público";
}

export function getPublicProfileHeaderSubtitle(): string {
  return "Estadísticas de jugador";
}

export function getMiniCourtIndicatorClasses(isSideActive: boolean): string {
  return cn(
    "h-full rounded-[1px] transition-colors",
    isSideActive ? "bg-primary" : "bg-muted"
  );
}

export function getRecentFormDotClasses(result: RecentFormResult): string {
  return cn(
    "h-2.5 w-2.5 rounded-full",
    result === "W" ? "bg-emerald-500" : "bg-rose-500"
  );
}

export function getPublicProfileWinRateLabel(): string {
  return "Efectividad";
}

export function getPublicProfileRecentFormLabel(): string {
  return "Forma";
}

export function getPublicProfileNetworkContactsLabel(): string {
  return "Contactos";
}

export function getPublicProfilePreferredSideHeadingText(): string {
  return "Lado preferido";
}

export function getPublicProfileSuccessfulPartnerLabel(): string {
  return "Pareja más exitosa";
}

export function getPublicProfileFrequentRivalLabel(): string {
  return "Rival más frecuente";
}

export function getPublicProfileHeadToHeadHeadingText(): string {
  return "Cara a Cara";
}

export function getPublicProfileAsPartnersLabel(): string {
  return "Como socios";
}

export function getPublicProfileAsRivalsLabel(): string {
  return "Como rivales";
}

export function getPublicProfileLastMatchLabel(): string {
  return "Último duelo";
}

export function getPublicProfileMatchHistoryHeadingText(): string {
  return "Historial Reciente";
}

export function getPublicProfileEmptyStateProps(): {
  title: string;
  description: string;
} {
  return {
    title: "Sin resultados todavía",
    description: "Este jugador aún no tiene partidos confirmados.",
  };
}

export function getPublicProfileMainClasses(): string {
  return "mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-10 pb-20 min-h-screen";
}

export function getPublicProfileHeaderClasses(): string {
  return "flex items-center gap-4";
}

export function getPublicProfileBackButtonClasses(): string {
  return "flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground border border-border shadow-xs transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

export function getPublicProfileHeaderSkeletonClasses(): string {
  return "flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground border border-border shadow-xs";
}

export function getPublicProfileAvatarBadgeClasses(): string {
  return "border-border bg-muted text-muted-foreground font-bold px-2.5 py-0.5 text-xs shadow-xs";
}

export function getPublicProfileStreakBadgeClasses(): string {
  return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800 font-bold px-3 py-0.5 text-xs shadow-xs";
}

export function getPublicProfileStatCardClasses(): string {
  return "flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-xs";
}

export function getPublicProfileNetworkCardClasses(): string {
  return "rounded-xl border border-border bg-card p-4 space-y-4 shadow-xs";
}

export function getPublicProfileNetworkBadgeClasses(): string {
  return "font-bold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full whitespace-nowrap shadow-xs";
}

export function getPublicProfileH2HCardClasses(): string {
  return "rounded-xl border border-border bg-card p-4 space-y-4 shadow-xs";
}

export function getPublicProfileH2HResultClasses(isViewerWinner: boolean): string {
  return cn(
    "text-xs font-bold",
    isViewerWinner
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400"
  );
}

export function getPublicProfileMiniCourtContainerClasses(): string {
  return "flex items-center justify-center shrink-0 w-10 h-7 rounded border border-border bg-card p-1 shadow-xs";
}

export function getPublicProfileMiniCourtGridClasses(): string {
  return "grid grid-cols-2 gap-0.5 w-full h-full rounded-[2px] overflow-hidden border border-border/80 bg-muted/40";
}

export function getPublicProfileShareButtonClasses(): string {
  return "h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all";
}
