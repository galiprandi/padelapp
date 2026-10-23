import { describe, it, expect } from "vitest";
import {
  formatStatus,
  teamKeyForPosition,
  defaultTeamLabel,
  getMatchInvitationTitle,
  getMatchInvitationMetadata,
  getMatchInvitationSkeletonAriaLabel,
  getInvitationBackButtonAriaLabel,
  getInvitationSubheadingText,
  getMatchInfoSectionHeaderTitle,
  getMatchInfoModeLabel,
  getMatchInfoSetsText,
  getMatchInfoStatusLabel,
  getMatchInfoClubPlaceholderText,
  getMatchInfoCourtText,
  getMatchInfoNotesHeaderTitle,
  getPlayersSectionHeaderTitle,
  getOpenSlotText,
  getPlayerConfirmationStatusText,
  getOrganizerBadgeText,
  getMatchViewButtonText,
  getSignInFormLabelForClub,
  getOrganizerSlotRequestNoticeText,
  getAlreadyParticipantNoticeText,
  getInvitationBackButtonClasses,
  getInvitationHeaderTitleClasses,
  getInvitationSubheadingClasses,
  getMatchInfoCardClasses,
  getMatchInfoCardHeaderClasses,
  getMatchInfoCardTitleClasses,
  getMatchInfoGridClasses,
  getMatchInfoTileClasses,
  getMatchInfoTileHeaderClasses,
  getMatchInfoTileValueClasses,
  getMatchInfoClubTileClasses,
  getMatchInfoNotesContainerClasses,
  getMatchInfoNotesHeaderClasses,
  getPlayersSectionClasses,
  getPlayersSectionHeaderClasses,
  getOpenSlotCardClasses,
  getOpenSlotIconContainerClasses,
  getOpenSlotTextClasses,
  getOccupiedPlayerCardClasses,
  getOccupiedPlayerNameClasses,
  getOccupiedPlayerStatusTextClasses,
  getOrganizerBadgeClasses,
  getInvitationPrimaryButtonClasses,
  getInvitationSignInFormClasses,
  getInvitationNoticeContainerClasses,
  getInvitationNoticeTextClasses,
  getInvitationSuccessNoticeContainerClasses,
  getInvitationSuccessNoticeTextClasses,
  MATCH_STATUS,
} from "../match-invitation-utils";

describe("match-invitation-utils", () => {
  describe("formatStatus", () => {
    it("formats PENDING status as 'Pendiente'", () => {
      expect(formatStatus(MATCH_STATUS.PENDING)).toBe("Pendiente");
    });

    it("formats CONFIRMED status as 'Confirmado'", () => {
      expect(formatStatus(MATCH_STATUS.CONFIRMED)).toBe("Confirmado");
    });

    it("formats DISPUTED status as 'En disputa'", () => {
      expect(formatStatus(MATCH_STATUS.DISPUTED)).toBe("En disputa");
    });

    it("formats CANCELLED status as 'Cancelado'", () => {
      expect(formatStatus(MATCH_STATUS.CANCELLED)).toBe("Cancelado");
    });

    it("returns raw status if unmapped", () => {
      expect(formatStatus("UNKNOWN")).toBe("UNKNOWN");
    });
  });

  describe("teamKeyForPosition", () => {
    it("assigns position 0 to team A and position 1 to team B for 2-player match", () => {
      expect(teamKeyForPosition(0, 2)).toBe("A");
      expect(teamKeyForPosition(1, 2)).toBe("B");
    });

    it("assigns positions 0 and 1 to team A and positions 2 and 3 to team B for 4-player match", () => {
      expect(teamKeyForPosition(0, 4)).toBe("A");
      expect(teamKeyForPosition(1, 4)).toBe("A");
      expect(teamKeyForPosition(2, 4)).toBe("B");
      expect(teamKeyForPosition(3, 4)).toBe("B");
    });
  });

  describe("defaultTeamLabel", () => {
    it("returns 'Jugador A' / 'Jugador B' for 2-player matches", () => {
      expect(defaultTeamLabel("A", 2)).toBe("Jugador A");
      expect(defaultTeamLabel("B", 2)).toBe("Jugador B");
    });

    it("returns 'Pareja A' / 'Pareja B' for 4-player matches", () => {
      expect(defaultTeamLabel("A", 4)).toBe("Pareja A");
      expect(defaultTeamLabel("B", 4)).toBe("Pareja B");
    });
  });

  describe("getMatchInvitationTitle", () => {
    it("returns 'Partido Amistoso' for FRIENDLY matchType", () => {
      expect(getMatchInvitationTitle("FRIENDLY")).toBe("Partido Amistoso");
    });

    it("returns 'Torneo Local' for non-FRIENDLY matchType", () => {
      expect(getMatchInvitationTitle("COMPETITIVE")).toBe("Torneo Local");
      expect(getMatchInvitationTitle("TOURNAMENT")).toBe("Torneo Local");
    });
  });

  describe("getMatchInvitationSkeletonAriaLabel", () => {
    it("returns localized ARIA label for match invitation loading skeleton", () => {
      expect(getMatchInvitationSkeletonAriaLabel()).toBe("Cargando invitación al partido...");
    });
  });

  describe("getMatchInvitationMetadata", () => {
    it("returns fallback metadata when match is null", () => {
      const meta = getMatchInvitationMetadata(null);
      expect(meta.title).toBe("Partido no encontrado");
      expect(meta.description).toContain("no existe");
    });

    it("returns localized title and description with club name and formatted date", () => {
      const testDate = new Date("2026-10-15T18:00:00Z");
      const meta = getMatchInvitationMetadata({
        club: "Club San Martín",
        date: testDate,
      });

      expect(meta.title).toBe("Invitación a Partido en Club San Martín");
      expect(meta.description).toContain("Club San Martín");
    });

    it("handles missing club name with default string", () => {
      const meta = getMatchInvitationMetadata({
        club: null,
        date: "2026-10-15",
      });

      expect(meta.title).toBe("Invitación a Partido en el club");
    });
  });

  describe("text & UI labels pure helpers", () => {
    it("getInvitationBackButtonAriaLabel returns 'Volver'", () => {
      expect(getInvitationBackButtonAriaLabel()).toBe("Volver");
    });

    it("getInvitationSubheadingText returns 'Invitación de Partido'", () => {
      expect(getInvitationSubheadingText()).toBe("Invitación de Partido");
    });

    it("getMatchInfoSectionHeaderTitle returns 'Información del encuentro'", () => {
      expect(getMatchInfoSectionHeaderTitle()).toBe("Información del encuentro");
    });

    it("getMatchInfoModeLabel returns 'Modalidad'", () => {
      expect(getMatchInfoModeLabel()).toBe("Modalidad");
    });

    it("getMatchInfoSetsText formats sets text correctly", () => {
      expect(getMatchInfoSetsText(3)).toBe("3 sets");
    });

    it("getMatchInfoStatusLabel returns 'Estado'", () => {
      expect(getMatchInfoStatusLabel()).toBe("Estado");
    });

    it("getMatchInfoClubPlaceholderText returns 'Club por definir'", () => {
      expect(getMatchInfoClubPlaceholderText()).toBe("Club por definir");
    });

    it("getMatchInfoCourtText formats court number or empty string", () => {
      expect(getMatchInfoCourtText("2")).toBe(" • Cancha 2");
      expect(getMatchInfoCourtText(null)).toBe("");
    });

    it("getMatchInfoNotesHeaderTitle returns 'Notas del organizador'", () => {
      expect(getMatchInfoNotesHeaderTitle()).toBe("Notas del organizador");
    });

    it("getPlayersSectionHeaderTitle returns 'Jugadores convocados'", () => {
      expect(getPlayersSectionHeaderTitle()).toBe("Jugadores convocados");
    });

    it("getOpenSlotText returns 'Cupo disponible'", () => {
      expect(getOpenSlotText()).toBe("Cupo disponible");
    });

    it("getPlayerConfirmationStatusText returns 'Confirmado' or 'Pendiente'", () => {
      expect(getPlayerConfirmationStatusText(true)).toBe("Confirmado");
      expect(getPlayerConfirmationStatusText(false)).toBe("Pendiente");
    });

    it("getOrganizerBadgeText returns 'Organizador'", () => {
      expect(getOrganizerBadgeText()).toBe("Organizador");
    });

    it("getMatchViewButtonText returns 'Ver partido en Padel Red'", () => {
      expect(getMatchViewButtonText()).toBe("Ver partido en Padel Red");
    });

    it("getSignInFormLabelForClub formats sign-in label appropriately", () => {
      expect(getSignInFormLabelForClub("El Bosque")).toBe("Iniciá sesión para unirte a El Bosque");
      expect(getSignInFormLabelForClub(null)).toBe("Iniciá sesión para unirte a el partido");
    });

    it("getOrganizerSlotRequestNoticeText returns notice text", () => {
      expect(getOrganizerSlotRequestNoticeText()).toBe("Para unirte, pedile al organizador tu enlace de cupo directo");
    });

    it("getAlreadyParticipantNoticeText returns notice text", () => {
      expect(getAlreadyParticipantNoticeText()).toBe("Ya formás parte de este partido");
    });
  });

  describe("pure CSS styling class helpers", () => {
    it("returns expected CSS class strings", () => {
      expect(getInvitationBackButtonClasses()).toContain("bg-muted");
      expect(getInvitationHeaderTitleClasses()).toContain("font-bold");
      expect(getInvitationSubheadingClasses()).toContain("text-muted-foreground");
      expect(getMatchInfoCardClasses()).toContain("border-border");
      expect(getMatchInfoCardHeaderClasses()).toContain("bg-muted");
      expect(getMatchInfoCardTitleClasses()).toContain("font-bold");
      expect(getMatchInfoGridClasses()).toContain("grid-cols-2");
      expect(getMatchInfoTileClasses()).toContain("flex-col");
      expect(getMatchInfoTileHeaderClasses()).toContain("items-center");
      expect(getMatchInfoTileValueClasses()).toContain("text-lg");
      expect(getMatchInfoClubTileClasses()).toContain("col-span-2");
      expect(getMatchInfoNotesContainerClasses()).toContain("italic");
      expect(getMatchInfoNotesHeaderClasses()).toContain("not-italic");
      expect(getPlayersSectionClasses()).toContain("space-y-4");
      expect(getPlayersSectionHeaderClasses()).toContain("text-sm");
      expect(getOpenSlotCardClasses()).toContain("border-dashed");
      expect(getOpenSlotIconContainerClasses()).toContain("bg-background");
      expect(getOpenSlotTextClasses()).toContain("italic");
      expect(getOccupiedPlayerCardClasses()).toContain("bg-card");
      expect(getOccupiedPlayerNameClasses()).toContain("font-bold");
      expect(getOccupiedPlayerStatusTextClasses(true)).toContain("text-emerald-600");
      expect(getOccupiedPlayerStatusTextClasses(false)).toContain("text-muted-foreground");
      expect(getOrganizerBadgeClasses()).toContain("bg-primary");
      expect(getInvitationPrimaryButtonClasses()).toContain("w-full");
      expect(getInvitationSignInFormClasses()).toContain("h-10");
      expect(getInvitationNoticeContainerClasses()).toContain("bg-muted");
      expect(getInvitationNoticeTextClasses()).toContain("text-xs");
      expect(getInvitationSuccessNoticeContainerClasses()).toContain("border-primary");
      expect(getInvitationSuccessNoticeTextClasses()).toContain("text-primary");
    });
  });
});
