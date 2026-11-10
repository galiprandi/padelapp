import { describe, it, expect } from "vitest";
import {
  getMatchDetailSkeletonAriaLabel,
  getMatchStatusBadgeText,
  getMatchDetailRegionAriaLabel,
  getMatchNotFoundTitle,
  getMatchNotFoundDescription,
  getMatchNotFoundButtonText,
  getMatchCancelledTitle,
  getMatchCancelledDescription,
  getMatchCancelledButtonText,
  getMatchScoreSets,
  getMatchShareButtonAriaLabel,
  getPlayerProfileLinkAriaLabel,
  formatMatchClubCourtText,
  getMatchHeaderTitle,
  getMatchClubLabel,
  getMatchOrganizerLabel,
  getMatchEnterScoreButtonText,
  getMatchEditButtonText,
  getMatchInviteShareTitle,
  getMatchResultShareTitle,
  getMatchFinalScoreHeadingTitle,
  getMatchModeLabel,
  getMatchConfirmationsHeadingTitle,
  getMatchConfirmationsDescription,
  getPlayerConfirmationStatusText,
  getMatchCreatorFinalizeNoticeText,
  getPendingConfirmationBannerTitle,
  getPendingConfirmationBannerDescription,
  getMatchProcessedNoticeText,
  getMatchAttendanceHeadingTitle,
  getMatchTeamsHeadingTitle,
  getMatchOrganizerNotesHeadingTitle,
  getMatchDetailSkeletonContainerClasses,
  getMatchDetailNotFoundContainerClasses,
  getMatchDetailCancelledContainerClasses,
  getMatchDetailMainContainerClasses,
  getMatchStatusBadgeClasses,
  getMatchDetailInfoSectionClasses,
  getMatchDetailClubCardClasses,
  getMatchDetailOrganizerCardClasses,
  getMatchDetailActionsSectionClasses,
  getMatchDetailPrimaryActionButtonClasses,
  getMatchDetailSecondaryActionButtonClasses,
  getMatchDetailScoreSummaryCardClasses,
  getMatchDetailScoreSetsGridClasses,
  getMatchDetailScoreSetItemClasses,
  getMatchDetailPlayerAvatarOverlayClasses,
  getMatchDetailPlayerAvatarLinkClasses,
  getMatchDetailConfirmationsCardClasses,
  getMatchDetailPlayerConfirmationItemClasses,
  getMatchDetailPlayerConfirmationNameClasses,
  getMatchDetailPlayerConfirmationStatusClasses,
  getMatchDetailStickyBannerContainerClasses,
  getMatchDetailStickyBannerCardClasses,
  getMatchDetailStickyBannerIconBadgeClasses,
  getMatchDetailProcessedNoticeClasses,
  getMatchDetailAttendanceCardClasses,
  getMatchDetailNotesCardClasses,
} from "../match-detail-utils";

describe("match-detail-utils", () => {
  it("returns correct skeleton aria-label", () => {
    expect(getMatchDetailSkeletonAriaLabel()).toBe("Cargando detalle del partido");
  });

  it("returns correct match status badge texts", () => {
    expect(getMatchStatusBadgeText("CONFIRMED")).toBe("Confirmado");
    expect(getMatchStatusBadgeText("PENDING")).toBe("Pendiente");
    expect(getMatchStatusBadgeText("CANCELLED")).toBe("Cancelado");
    expect(getMatchStatusBadgeText("IN_PROGRESS")).toBe("En disputa");
    expect(getMatchStatusBadgeText(null)).toBe("En disputa");
    expect(getMatchStatusBadgeText(undefined)).toBe("En disputa");
  });

  it("returns correct region landmark ARIA labels", () => {
    expect(getMatchDetailRegionAriaLabel("header")).toBe("Encabezado del partido");
    expect(getMatchDetailRegionAriaLabel("details")).toBe("Detalles e información del partido");
    expect(getMatchDetailRegionAriaLabel("actions")).toBe("Acciones del partido");
    expect(getMatchDetailRegionAriaLabel("summary")).toBe("Resumen de resultado del partido");
    expect(getMatchDetailRegionAriaLabel("confirmations")).toBe("Estado de confirmaciones de jugadores");
    expect(getMatchDetailRegionAriaLabel("attendance")).toBe("Asistencia de jugadores");
    expect(getMatchDetailRegionAriaLabel("teams")).toBe("Formación de equipos");
    expect(getMatchDetailRegionAriaLabel("notes")).toBe("Notas del organizador");
    expect(getMatchDetailRegionAriaLabel("skeleton")).toBe("Cargando detalle del partido");
    expect(getMatchDetailRegionAriaLabel("not_found")).toBe("Partido no encontrado");
    expect(getMatchDetailRegionAriaLabel("cancelled")).toBe("Partido cancelado");
  });

  it("returns not found texts", () => {
    expect(getMatchNotFoundTitle()).toBe("Partido no encontrado");
    expect(getMatchNotFoundDescription()).toBe("El partido que buscás no existe o fue eliminado.");
    expect(getMatchNotFoundButtonText()).toBe("Crear partido");
  });

  it("returns cancelled texts", () => {
    expect(getMatchCancelledTitle()).toBe("Partido cancelado");
    expect(getMatchCancelledDescription()).toBe("Este partido fue cancelado por el organizador.");
    expect(getMatchCancelledButtonText()).toBe("Volver a mis partidos");
  });

  it("parses score sets correctly", () => {
    expect(getMatchScoreSets("6-4, 4-6, 7-6")).toEqual(["6-4", "4-6", "7-6"]);
    expect(getMatchScoreSets("6-2 ,  6-3 ")).toEqual(["6-2", "6-3"]);
    expect(getMatchScoreSets("")).toEqual([]);
    expect(getMatchScoreSets(null)).toEqual([]);
    expect(getMatchScoreSets(undefined)).toEqual([]);
  });

  it("returns correct share button ARIA label", () => {
    expect(getMatchShareButtonAriaLabel(true)).toBe("Compartir resultado del partido");
    expect(getMatchShareButtonAriaLabel(false)).toBe("Compartir invitación al partido");
  });

  it("returns correct player profile link ARIA label", () => {
    expect(getPlayerProfileLinkAriaLabel("Agustín Tapia")).toBe("Ver perfil de Agustín Tapia");
    expect(getPlayerProfileLinkAriaLabel("")).toBe("Ver perfil del jugador");
    expect(getPlayerProfileLinkAriaLabel(null)).toBe("Ver perfil del jugador");
    expect(getPlayerProfileLinkAriaLabel(undefined)).toBe("Ver perfil del jugador");
  });

  it("formats club and court text correctly", () => {
    expect(formatMatchClubCourtText("Padel Club Central", "3")).toBe("Padel Club Central · Cancha 3");
    expect(formatMatchClubCourtText("Padel Club Central", "")).toBe("Padel Club Central");
    expect(formatMatchClubCourtText("Padel Club Central", null)).toBe("Padel Club Central");
    expect(formatMatchClubCourtText("", "3")).toBe("Sin club especificado");
    expect(formatMatchClubCourtText(null, null)).toBe("Sin club especificado");
  });

  it("returns match detail header title", () => {
    expect(getMatchHeaderTitle("Competitivo")).toBe("Partido Competitivo");
    expect(getMatchHeaderTitle("Amistoso")).toBe("Partido Amistoso");
  });

  it("returns static text labels and titles", () => {
    expect(getMatchClubLabel()).toBe("Club:");
    expect(getMatchOrganizerLabel()).toBe("Organizador");
    expect(getMatchEnterScoreButtonText()).toBe("Ingresar Resultado");
    expect(getMatchEditButtonText()).toBe("Editar");
    expect(getMatchInviteShareTitle()).toBe("Invitación a partido de Pádel");
    expect(getMatchResultShareTitle()).toBe("Resultado de Pádel");
    expect(getMatchFinalScoreHeadingTitle()).toBe("Resultado Final");
    expect(getMatchConfirmationsHeadingTitle()).toBe("Confirmaciones");
    expect(getMatchConfirmationsDescription()).toBe("Un jugador de cada equipo debe validar el marcador.");
    expect(getMatchCreatorFinalizeNoticeText()).toBe("¿Algunos jugadores no confirman o son invitados? Como organizador podés cerrar el partido inmediatamente.");
    expect(getPendingConfirmationBannerTitle()).toBe("Confirmación pendiente");
    expect(getPendingConfirmationBannerDescription()).toBe("Validá el resultado para impactar el ranking.");
    expect(getMatchProcessedNoticeText()).toBe("Partido procesado en el Ranking");
    expect(getMatchAttendanceHeadingTitle()).toBe("Asistencia");
    expect(getMatchTeamsHeadingTitle()).toBe("Formación de equipos");
    expect(getMatchOrganizerNotesHeadingTitle()).toBe("Notas del organizador");
  });

  it("formats match mode label", () => {
    expect(getMatchModeLabel("Competitivo")).toBe("Modalidad Competitivo");
  });

  it("returns player confirmation status text", () => {
    expect(getPlayerConfirmationStatusText(true)).toBe("Confirmado");
    expect(getPlayerConfirmationStatusText(false)).toBe("Pendiente");
  });

  describe("UI styling and layout CSS classes helpers", () => {
    it("returns correct skeleton container classes", () => {
      expect(getMatchDetailSkeletonContainerClasses()).toBe("flex flex-col gap-6");
    });

    it("returns correct not found and cancelled container classes", () => {
      expect(getMatchDetailNotFoundContainerClasses()).toBe("flex flex-col gap-4");
      expect(getMatchDetailCancelledContainerClasses()).toBe("flex flex-col gap-4");
    });

    it("returns correct main container classes with and without confirm padding", () => {
      expect(getMatchDetailMainContainerClasses(true)).toBe("flex flex-col gap-6 pb-32");
      expect(getMatchDetailMainContainerClasses(false)).toBe("flex flex-col gap-6");
      expect(getMatchDetailMainContainerClasses()).toBe("flex flex-col gap-6");
    });

    it("returns correct match status badge classes", () => {
      expect(getMatchStatusBadgeClasses("CONFIRMED")).toContain("bg-emerald-100 text-emerald-800");
      expect(getMatchStatusBadgeClasses("PENDING")).toContain("bg-muted text-muted-foreground");
      expect(getMatchStatusBadgeClasses("CANCELLED")).toContain("bg-muted text-muted-foreground");
      expect(getMatchStatusBadgeClasses(null)).toContain("bg-muted text-muted-foreground");
    });

    it("returns correct info section and club card classes", () => {
      expect(getMatchDetailInfoSectionClasses()).toBe("space-y-2");
      expect(getMatchDetailClubCardClasses()).toContain("rounded-xl border border-border bg-card shadow-xs p-3");
    });

    it("returns correct organizer card classes for link and static variants", () => {
      const linkClasses = getMatchDetailOrganizerCardClasses(true);
      expect(linkClasses).toContain("transition-all hover:bg-muted active:scale-[0.98]");
      expect(linkClasses).toContain("focus-visible:ring-2");

      const staticClasses = getMatchDetailOrganizerCardClasses(false);
      expect(staticClasses).toContain("flex items-center gap-2 rounded-xl border border-border bg-card shadow-xs p-3");
      expect(staticClasses).not.toContain("active:scale-[0.98]");
    });

    it("returns correct actions section and action button classes", () => {
      expect(getMatchDetailActionsSectionClasses()).toBe("flex flex-col gap-2");
      expect(getMatchDetailPrimaryActionButtonClasses()).toContain("w-full h-12 active:scale-[0.98]");
      expect(getMatchDetailSecondaryActionButtonClasses()).toContain("flex-1 h-10 active:scale-[0.98]");
    });

    it("returns correct score summary card, sets grid and item classes", () => {
      expect(getMatchDetailScoreSummaryCardClasses()).toContain("py-10 rounded-xl border border-border bg-card shadow-xs");
      expect(getMatchDetailScoreSetsGridClasses()).toBe("flex flex-wrap items-center justify-center gap-x-8 gap-y-4 px-4");
      expect(getMatchDetailScoreSetItemClasses()).toBe("text-5xl font-bold text-foreground leading-none");
    });

    it("returns correct player avatar overlay and link classes", () => {
      expect(getMatchDetailPlayerAvatarOverlayClasses()).toContain("border-2 border-card transition-all hover:opacity-80 active:scale-[0.95]");
      expect(getMatchDetailPlayerAvatarLinkClasses()).toContain("rounded-full z-10 hover:z-20 relative");
    });

    it("returns correct confirmations section card and item classes", () => {
      expect(getMatchDetailConfirmationsCardClasses()).toBe("space-y-4 rounded-xl border border-border bg-card shadow-xs p-4");

      const confirmedItem = getMatchDetailPlayerConfirmationItemClasses(true);
      expect(confirmedItem).toContain("bg-card border-primary font-semibold");

      const pendingItem = getMatchDetailPlayerConfirmationItemClasses(false);
      expect(pendingItem).toContain("bg-muted/50 border-border opacity-70");
    });

    it("returns correct player confirmation name and status text classes", () => {
      expect(getMatchDetailPlayerConfirmationNameClasses(true)).toContain("text-foreground");
      expect(getMatchDetailPlayerConfirmationNameClasses(false)).toContain("text-muted-foreground");

      expect(getMatchDetailPlayerConfirmationStatusClasses(true)).toBe("text-xs font-semibold text-primary");
      expect(getMatchDetailPlayerConfirmationStatusClasses(false)).toBe("text-xs font-semibold text-muted-foreground/60");
    });

    it("returns correct sticky banner container, card and badge classes", () => {
      expect(getMatchDetailStickyBannerContainerClasses()).toBe("fixed bottom-20 left-0 right-0 z-30 px-5 pb-4");
      expect(getMatchDetailStickyBannerCardClasses()).toContain("rounded-xl border border-primary/20 bg-card p-4 shadow-sm");
      expect(getMatchDetailStickyBannerIconBadgeClasses()).toContain("bg-primary text-primary-foreground font-bold shadow-xs");
    });

    it("returns correct processed notice, attendance and notes card classes", () => {
      expect(getMatchDetailProcessedNoticeClasses()).toContain("bg-emerald-100 text-emerald-800 border border-emerald-300");
      expect(getMatchDetailAttendanceCardClasses()).toBe("space-y-3 rounded-xl border border-border bg-card shadow-xs p-4");
      expect(getMatchDetailNotesCardClasses()).toBe("rounded-xl border border-border bg-card shadow-xs p-4");
    });
  });
});
