import { describe, it, expect } from "vitest";
import {
  formatJoinSlotInvitationMessage,
  formatStatus,
  teamKeyForPosition,
  defaultTeamLabel,
  MATCH_STATUS,
  getJoinSlotHelperMessage,
  groupMatchSlotsByTeam,
  getJoinSlotRegionAriaLabel,
  getSlotStatusBadgeProps,
  getJoinSlotButtonAriaLabel,
  getJoinSlotButtonText,
  getJoinSlotSuccessToast,
  getJoinSlotErrorToast,
  getJoinSlotSkeletonAriaLabel,
  getJoinSlotHeaderTitle,
  getJoinSlotHeaderSubtitle,
  getJoinSlotBackAriaLabel,
  getJoinSlotInvitationLabel,
  getJoinSlotMatchDetailTitle,
  getJoinSlotClubSubtext,
  getJoinSlotCourtText,
  getJoinSlotFormationTitle,
  getJoinSlotJoiningAsLabel,
  getJoinSlotAlreadyJoinedButtonText,
  getJoinSlotViewMatchDetailsText,
  formatSlotPositionText,
  getSignInFormLabelForMatch,
  getJoinSlotMainClasses,
  getJoinSlotHeaderClasses,
  getJoinSlotBackButtonClasses,
  getJoinSlotInvitationCardClasses,
  getJoinSlotMatchCardClasses,
  getJoinSlotSlotItemClasses,
  getJoinSlotSlotNameClasses,
  getJoinSlotHelperWarningClasses,
  getJoinSlotFooterContainerClasses,
  getJoinSlotFooterIconBadgeClasses,
  getJoinSlotAlreadyJoinedButtonClasses,
  getJoinSlotDetailLinkClasses,
} from "../join-slot-utils";

describe("join-slot-utils", () => {
  describe("formatJoinSlotInvitationMessage", () => {
    it("formats message with creator name when provided", () => {
      expect(formatJoinSlotInvitationMessage("Agustín Tapia", "Pareja A")).toBe(
        "Agustín Tapia te invitó a sumarte como Pareja A."
      );
    });

    it("handles whitespace in creator name", () => {
      expect(formatJoinSlotInvitationMessage("  Bela  ", "Pareja B")).toBe(
        "Bela te invitó a sumarte como Pareja B."
      );
    });

    it("falls back to generic invitation message when creator name is missing or empty", () => {
      expect(formatJoinSlotInvitationMessage(null, "Pareja A")).toBe(
        "Te invitaron a sumarte como Pareja A."
      );
      expect(formatJoinSlotInvitationMessage(undefined, "Pareja B")).toBe(
        "Te invitaron a sumarte como Pareja B."
      );
      expect(formatJoinSlotInvitationMessage("   ", "Pareja A")).toBe(
        "Te invitaron a sumarte como Pareja A."
      );
    });
  });

  describe("formatStatus", () => {
    it("formats match status correctly", () => {
      expect(formatStatus(MATCH_STATUS.CONFIRMED)).toBe("Confirmado");
      expect(formatStatus(MATCH_STATUS.DISPUTED)).toBe("En disputa");
      expect(formatStatus(MATCH_STATUS.CANCELLED)).toBe("Cancelado");
      expect(formatStatus(MATCH_STATUS.PENDING)).toBe("Pendiente");
    });
  });

  describe("teamKeyForPosition", () => {
    it("returns team A or B for 4-player matches", () => {
      expect(teamKeyForPosition(0, 4)).toBe("A");
      expect(teamKeyForPosition(1, 4)).toBe("A");
      expect(teamKeyForPosition(2, 4)).toBe("B");
      expect(teamKeyForPosition(3, 4)).toBe("B");
    });

    it("returns team A or B for singles 2-player matches", () => {
      expect(teamKeyForPosition(0, 2)).toBe("A");
      expect(teamKeyForPosition(1, 2)).toBe("B");
    });
  });

  describe("defaultTeamLabel", () => {
    it("returns Pareja A/B for 4-player matches", () => {
      expect(defaultTeamLabel("A", 4)).toBe("Pareja A");
      expect(defaultTeamLabel("B", 4)).toBe("Pareja B");
    });

    it("returns Jugador A/B for singles 2-player matches", () => {
      expect(defaultTeamLabel("A", 2)).toBe("Jugador A");
      expect(defaultTeamLabel("B", 2)).toBe("Jugador B");
    });
  });

  describe("getJoinSlotHelperMessage", () => {
    it("returns occupied warning when slot is taken by another user", () => {
      expect(
        getJoinSlotHelperMessage({
          slotTaken: true,
          slotTakenByViewer: false,
          matchClosed: false,
          viewerAlreadyInMatch: false,
        })
      ).toBe("Cupo ocupado, hablá con el organizador del partido.");
    });

    it("returns closed warning when match status is not pending", () => {
      expect(
        getJoinSlotHelperMessage({
          slotTaken: false,
          slotTakenByViewer: false,
          matchClosed: true,
          viewerAlreadyInMatch: false,
        })
      ).toBe("El partido ya no admite nuevas confirmaciones.");
    });

    it("returns already enrolled warning when viewer is in another slot", () => {
      expect(
        getJoinSlotHelperMessage({
          slotTaken: false,
          slotTakenByViewer: false,
          matchClosed: false,
          viewerAlreadyInMatch: true,
        })
      ).toBe("Ya estás inscripto en otro cupo para este partido.");
    });

    it("returns null when slot can be joined", () => {
      expect(
        getJoinSlotHelperMessage({
          slotTaken: false,
          slotTakenByViewer: false,
          matchClosed: false,
          viewerAlreadyInMatch: false,
        })
      ).toBeNull();
    });
  });

  describe("groupMatchSlotsByTeam", () => {
    it("groups 4-player slots into Team A and Team B", () => {
      const slots = [
        { id: "s1", position: 0 },
        { id: "s2", position: 1 },
        { id: "s3", position: 2 },
        { id: "s4", position: 3 },
      ];
      const grouped = groupMatchSlotsByTeam(slots, 4);
      expect(grouped.A).toHaveLength(2);
      expect(grouped.B).toHaveLength(2);
      expect(grouped.A[0].id).toBe("s1");
      expect(grouped.B[0].id).toBe("s3");
    });
  });

  describe("getJoinSlotRegionAriaLabel", () => {
    it("returns correct Argentine Spanish ARIA region labels", () => {
      expect(getJoinSlotRegionAriaLabel("header")).toBe("Encabezado de invitación");
      expect(getJoinSlotRegionAriaLabel("invitation")).toBe("Mensaje de invitación");
      expect(getJoinSlotRegionAriaLabel("match-detail")).toBe("Detalle del partido");
      expect(getJoinSlotRegionAriaLabel("formation")).toBe("Formación de los equipos");
      expect(getJoinSlotRegionAriaLabel("footer")).toBe("Confirmación de inscripción");
    });
  });

  describe("getSlotStatusBadgeProps", () => {
    it("returns confirmed badge properties when true", () => {
      const props = getSlotStatusBadgeProps(true);
      expect(props.text).toBe("Confirmado");
      expect(props.className).toContain("bg-emerald-100");
    });

    it("returns pending badge properties when false", () => {
      const props = getSlotStatusBadgeProps(false);
      expect(props.text).toBe("Pendiente");
      expect(props.className).toContain("bg-amber-100");
    });
  });

  describe("getJoinSlotButtonAriaLabel", () => {
    it("returns pending ARIA label when isPending is true", () => {
      expect(getJoinSlotButtonAriaLabel(true)).toBe(
        "Confirmando lugar en el partido..."
      );
    });

    it("returns default ARIA label when isPending is false", () => {
      expect(getJoinSlotButtonAriaLabel(false)).toBe(
        "Confirmar mi lugar en el partido"
      );
    });
  });

  describe("getJoinSlotButtonText", () => {
    it("returns pending button text when isPending is true", () => {
      expect(getJoinSlotButtonText(true)).toBe("Confirmando...");
    });

    it("returns default button text when isPending is false", () => {
      expect(getJoinSlotButtonText(false)).toBe("Confirmar mi lugar");
    });
  });

  describe("getJoinSlotSuccessToast", () => {
    it("returns localized success toast message", () => {
      expect(getJoinSlotSuccessToast()).toBe("Te sumaste al partido.");
    });
  });

  describe("getJoinSlotErrorToast", () => {
    it("returns custom server error message when provided", () => {
      expect(getJoinSlotErrorToast("No hay cupo disponible.")).toBe(
        "No hay cupo disponible."
      );
    });

    it("returns default error fallback toast message when message is missing", () => {
      expect(getJoinSlotErrorToast()).toBe("No pudimos sumarte al partido.");
      expect(getJoinSlotErrorToast(undefined)).toBe("No pudimos sumarte al partido.");
    });
  });

  describe("getJoinSlotSkeletonAriaLabel", () => {
    it("returns localized ARIA region label for loading skeleton", () => {
      expect(getJoinSlotSkeletonAriaLabel()).toBe(
        "Cargando detalles de la invitación al partido..."
      );
    });
  });

  describe("new join slot pure helpers", () => {
    it("returns static header title, subtitle, and back ARIA label", () => {
      expect(getJoinSlotHeaderTitle()).toBe("Invitación a jugar");
      expect(getJoinSlotHeaderSubtitle()).toBe("Invitación directa para partido de pádel");
      expect(getJoinSlotBackAriaLabel()).toBe("Volver");
    });

    it("returns invitation, match detail, club, and formation labels", () => {
      expect(getJoinSlotInvitationLabel()).toBe("Invitación enviada");
      expect(getJoinSlotMatchDetailTitle()).toBe("Detalle del partido");
      expect(getJoinSlotClubSubtext()).toBe("Sede del encuentro");
      expect(getJoinSlotFormationTitle()).toBe("Formación actual");
      expect(getJoinSlotJoiningAsLabel()).toBe("Te unirás como");
      expect(getJoinSlotAlreadyJoinedButtonText()).toBe("Ya estás unido · Ver partido");
      expect(getJoinSlotViewMatchDetailsText()).toBe("Ver todos los detalles del encuentro");
    });

    it("formats court text correctly", () => {
      expect(getJoinSlotCourtText("3")).toBe("(Cancha 3)");
      expect(getJoinSlotCourtText(null)).toBe("");
    });

    it("formats slot position text correctly", () => {
      expect(formatSlotPositionText(0)).toBe("Jugador 1");
      expect(formatSlotPositionText(3)).toBe("Jugador 4");
    });

    it("formats sign in form label for match with club or fallback", () => {
      expect(getSignInFormLabelForMatch("Padel Club Central")).toBe(
        "Iniciá sesión para unirte a Padel Club Central"
      );
      expect(getSignInFormLabelForMatch(null)).toBe(
        "Iniciá sesión para unirte a el partido"
      );
    });

    it("returns correct CSS class strings for join slot layout and UI elements", () => {
      expect(getJoinSlotMainClasses()).toBe("mx-auto min-h-screen w-full max-w-md flex flex-col gap-6 px-6 py-10 pb-48");
      expect(getJoinSlotHeaderClasses()).toBe("flex items-center gap-4");
      expect(getJoinSlotBackButtonClasses()).toContain("bg-muted text-muted-foreground");
      expect(getJoinSlotInvitationCardClasses()).toBe("rounded-xl border border-border bg-card p-4 shadow-xs");
      expect(getJoinSlotMatchCardClasses()).toBe("rounded-xl border-border bg-card overflow-hidden shadow-xs");
      expect(getJoinSlotSlotItemClasses(true)).toContain("border-primary font-semibold");
      expect(getJoinSlotSlotItemClasses(false)).toContain("border-border shadow-xs");
      expect(getJoinSlotSlotNameClasses(true)).toContain("text-foreground");
      expect(getJoinSlotSlotNameClasses(false)).toContain("text-muted-foreground italic");
      expect(getJoinSlotHelperWarningClasses()).toContain("text-destructive");
      expect(getJoinSlotHelperWarningClasses()).toContain("border-destructive");
      expect(getJoinSlotFooterContainerClasses()).toContain("fixed bottom-0 left-0 right-0");
      expect(getJoinSlotFooterIconBadgeClasses()).toContain("bg-primary");
      expect(getJoinSlotFooterIconBadgeClasses()).toContain("text-primary-foreground");
      expect(getJoinSlotAlreadyJoinedButtonClasses()).toContain("w-full h-12 rounded-lg");
      expect(getJoinSlotDetailLinkClasses()).toContain("block text-center text-xs");
    });
  });
});
