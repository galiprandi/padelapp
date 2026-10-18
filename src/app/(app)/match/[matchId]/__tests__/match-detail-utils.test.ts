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
});
