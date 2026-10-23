import { cn } from "@/lib/utils";

export const MATCH_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DISPUTED: "DISPUTED",
  CANCELLED: "CANCELLED",
} as const;

export function formatStatus(status: string): string {
  switch (status) {
    case MATCH_STATUS.PENDING:
      return "Pendiente";
    case MATCH_STATUS.CONFIRMED:
      return "Confirmado";
    case MATCH_STATUS.DISPUTED:
      return "En disputa";
    case MATCH_STATUS.CANCELLED:
      return "Cancelado";
    default:
      return status;
  }
}

export function teamKeyForPosition(
  position: number,
  totalPlayers: number,
): "A" | "B" {
  if (totalPlayers <= 2) {
    return position === 0 ? "A" : "B";
  }
  return position < 2 ? "A" : "B";
}

export function defaultTeamLabel(
  teamKey: "A" | "B",
  totalPlayers: number,
): string {
  if (totalPlayers <= 2) {
    return teamKey === "A" ? "Jugador A" : "Jugador B";
  }
  return teamKey === "A" ? "Pareja A" : "Pareja B";
}

export function getMatchInvitationTitle(matchType: string): string {
  return matchType === "FRIENDLY" ? "Partido Amistoso" : "Torneo Local";
}

export function getMatchInvitationMetadata(match: {
  club?: string | null;
  date?: Date | string | null;
} | null): { title: string; description: string } {
  if (!match) {
    return {
      title: "Partido no encontrado",
      description: "El partido que estás buscando no existe o fue cancelado.",
    };
  }

  const clubName = match.club || "el club";
  const formattedDate = match.date
    ? new Date(match.date).toLocaleDateString("es-AR")
    : "fecha por confirmar";

  return {
    title: `Invitación a Partido en ${clubName}`,
    description: `Sumate al partido en ${clubName} el ${formattedDate}.`,
  };
}

/**
 * Returns accessible ARIA region label for match invitation skeleton loading container.
 */
export function getMatchInvitationSkeletonAriaLabel(): string {
  return "Cargando invitación al partido...";
}

/**
 * Returns accessible ARIA label for back button
 */
export function getInvitationBackButtonAriaLabel(): string {
  return "Volver";
}

/**
 * Returns subheading text for invitation page
 */
export function getInvitationSubheadingText(): string {
  return "Invitación de Partido";
}

/**
 * Returns section heading title text for match info card
 */
export function getMatchInfoSectionHeaderTitle(): string {
  return "Información del encuentro";
}

/**
 * Returns label text for match modality (sets) tile
 */
export function getMatchInfoModeLabel(): string {
  return "Modalidad";
}

/**
 * Returns formatted text for set count
 */
export function getMatchInfoSetsText(sets: number): string {
  return `${sets} sets`;
}

/**
 * Returns label text for match status tile
 */
export function getMatchInfoStatusLabel(): string {
  return "Estado";
}

/**
 * Returns placeholder text when match club is not specified
 */
export function getMatchInfoClubPlaceholderText(): string {
  return "Club por definir";
}

/**
 * Returns court number text
 */
export function getMatchInfoCourtText(courtNumber?: string | null): string {
  return courtNumber ? ` • Cancha ${courtNumber}` : "";
}

/**
 * Returns title text for organizer notes block
 */
export function getMatchInfoNotesHeaderTitle(): string {
  return "Notas del organizador";
}

/**
 * Returns heading title text for players section
 */
export function getPlayersSectionHeaderTitle(): string {
  return "Jugadores convocados";
}

/**
 * Returns open slot title text
 */
export function getOpenSlotText(): string {
  return "Cupo disponible";
}

/**
 * Returns localized confirmation status text for player slot
 */
export function getPlayerConfirmationStatusText(isConfirmed: boolean): string {
  return isConfirmed ? "Confirmado" : "Pendiente";
}

/**
 * Returns text for organizer badge
 */
export function getOrganizerBadgeText(): string {
  return "Organizador";
}

/**
 * Returns button text for viewing match in Padel Red
 */
export function getMatchViewButtonText(): string {
  return "Ver partido en Padel Red";
}

/**
 * Returns sign-in form prompt label for invitation page
 */
export function getSignInFormLabelForClub(clubName?: string | null): string {
  return `Iniciá sesión para unirte a ${clubName ?? "el partido"}`;
}

/**
 * Returns notice text when participant needs direct link to join
 */
export function getOrganizerSlotRequestNoticeText(): string {
  return "Para unirte, pedile al organizador tu enlace de cupo directo";
}

/**
 * Returns notice text when viewer is already part of the match
 */
export function getAlreadyParticipantNoticeText(): string {
  return "Ya formás parte de este partido";
}

/**
 * Returns CSS classes for back button
 */
export function getInvitationBackButtonClasses(): string {
  return "flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]";
}

/**
 * Returns CSS classes for invitation header title
 */
export function getInvitationHeaderTitleClasses(): string {
  return "text-xl font-bold text-foreground";
}

/**
 * Returns CSS classes for invitation header subheading
 */
export function getInvitationSubheadingClasses(): string {
  return "text-sm text-muted-foreground";
}

/**
 * Returns CSS classes for match info card container
 */
export function getMatchInfoCardClasses(): string {
  return "rounded-xl border border-border bg-card overflow-hidden";
}

/**
 * Returns CSS classes for match info card header
 */
export function getMatchInfoCardHeaderClasses(): string {
  return "bg-muted border-b border-border px-4 py-3";
}

/**
 * Returns CSS classes for match info card header title
 */
export function getMatchInfoCardTitleClasses(): string {
  return "text-sm font-bold text-foreground flex items-center gap-2";
}

/**
 * Returns CSS classes for match info grid
 */
export function getMatchInfoGridClasses(): string {
  return "grid grid-cols-2 gap-px bg-border";
}

/**
 * Returns CSS classes for match info tile
 */
export function getMatchInfoTileClasses(): string {
  return "bg-card p-4 flex flex-col gap-1";
}

/**
 * Returns CSS classes for match info tile header label
 */
export function getMatchInfoTileHeaderClasses(): string {
  return "flex items-center gap-2 text-muted-foreground";
}

/**
 * Returns CSS classes for match info tile value
 */
export function getMatchInfoTileValueClasses(): string {
  return "text-lg font-bold";
}

/**
 * Returns CSS classes for match info club tile
 */
export function getMatchInfoClubTileClasses(): string {
  return "col-span-2 bg-card p-4 flex items-center gap-4 border-t border-border";
}

/**
 * Returns CSS classes for match info notes container
 */
export function getMatchInfoNotesContainerClasses(): string {
  return "p-4 bg-muted border-t border-border text-sm text-muted-foreground italic leading-relaxed";
}

/**
 * Returns CSS classes for match info notes header
 */
export function getMatchInfoNotesHeaderClasses(): string {
  return "block text-xs font-bold not-italic mb-1 text-foreground";
}

/**
 * Returns CSS classes for players section container
 */
export function getPlayersSectionClasses(): string {
  return "space-y-4";
}

/**
 * Returns CSS classes for players section header title
 */
export function getPlayersSectionHeaderClasses(): string {
  return "text-sm font-bold text-foreground flex items-center gap-2";
}

/**
 * Returns CSS classes for open slot card
 */
export function getOpenSlotCardClasses(): string {
  return "flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted p-3 text-muted-foreground";
}

/**
 * Returns CSS classes for open slot icon container
 */
export function getOpenSlotIconContainerClasses(): string {
  return "h-10 w-10 rounded-lg bg-background border border-dashed border-border flex items-center justify-center";
}

/**
 * Returns CSS classes for open slot text
 */
export function getOpenSlotTextClasses(): string {
  return "text-xs font-semibold italic";
}

/**
 * Returns CSS classes for occupied player slot card
 */
export function getOccupiedPlayerCardClasses(): string {
  return "flex items-center gap-3 rounded-xl bg-card p-3 border border-border";
}

/**
 * Returns CSS classes for occupied player name text
 */
export function getOccupiedPlayerNameClasses(): string {
  return "font-bold text-sm truncate leading-tight";
}

/**
 * Returns CSS classes for player confirmation status text
 */
export function getOccupiedPlayerStatusTextClasses(isConfirmed: boolean): string {
  return cn(
    "text-xs font-semibold",
    isConfirmed ? "text-emerald-600" : "text-muted-foreground"
  );
}

/**
 * Returns CSS classes for organizer badge
 */
export function getOrganizerBadgeClasses(): string {
  return "rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground";
}

/**
 * Returns CSS classes for invitation primary CTA button
 */
export function getInvitationPrimaryButtonClasses(): string {
  return "w-full h-12 rounded-lg text-base font-bold shadow-sm transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Returns CSS classes for invitation sign-in form button
 */
export function getInvitationSignInFormClasses(): string {
  return "w-full h-10 rounded-lg text-sm font-semibold text-muted-foreground transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background";
}

/**
 * Returns CSS classes for invitation notice container
 */
export function getInvitationNoticeContainerClasses(): string {
  return "rounded-xl p-3 bg-muted border border-border text-center";
}

/**
 * Returns CSS classes for invitation notice text
 */
export function getInvitationNoticeTextClasses(): string {
  return "text-xs font-medium text-muted-foreground";
}

/**
 * Returns CSS classes for invitation success/joined notice container
 */
export function getInvitationSuccessNoticeContainerClasses(): string {
  return "rounded-xl p-3 bg-card border border-primary text-center shadow-sm";
}

/**
 * Returns CSS classes for invitation success/joined notice text
 */
export function getInvitationSuccessNoticeTextClasses(): string {
  return "text-xs font-bold text-primary";
}
