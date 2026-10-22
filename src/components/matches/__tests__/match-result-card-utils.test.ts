import { describe, it, expect } from "vitest";
import {
  getMatchQuickConfirmSuccessToast,
  getMatchQuickConfirmErrorToast,
  getMatchQuickConfirmButtonAriaLabel,
  getMatchQuickConfirmButtonText,
  getMatchShareTitle,
  getMatchShareButtonAriaLabel,
  getMatchDetailLinkText,
  getMatchVersusSeparatorText,
  getMatchScorePlaceholderText,
  getMatchTeamPlayerNameText,
  getMatchStatusBadgeText,
  getMatchStatusBadgeVariant,
  getMatchDetailLinkAriaLabel,
  getMatchPlayerSideLabel,
  getMatchPlayerAvatarAriaLabel,
  getMatchResultCardRegionAriaLabel,
  getMatchResultCardContainerClasses,
  getMatchResultCardHeaderClasses,
  getMatchResultCardTitleClasses,
  getMatchResultCardContentClasses,
  getMatchResultCardFooterClasses,
  getMatchQuickConfirmButtonClasses,
  getMatchShareButtonClasses,
  getMatchDetailLinkClasses,
  getMatchTeamContainerClasses,
  getMatchPlayerAvatarClasses,
  getMatchPlayerNameClasses,
  getMatchSideBadgeClasses,
  getMatchScoreSegmentClasses,
  getMatchVersusDividerClasses,
} from "../match-result-card-utils";

describe("match-result-card-utils", () => {
  it("returns correct success and error toasts for quick confirmation", () => {
    expect(getMatchQuickConfirmSuccessToast()).toBe("Confirmaste el resultado. 🏆");
    expect(getMatchQuickConfirmErrorToast(null)).toBe("No pudimos confirmar el resultado.");
    expect(getMatchQuickConfirmErrorToast("Error de conexión")).toBe("Error de conexión");
  });

  it("returns correct ARIA label for quick confirm button", () => {
    expect(getMatchQuickConfirmButtonAriaLabel(null)).toBe("Confirmar resultado del partido");
    expect(getMatchQuickConfirmButtonAriaLabel("")).toBe("Confirmar resultado del partido");
    expect(getMatchQuickConfirmButtonAriaLabel("6-4, 6-3")).toBe(
      "Confirmar resultado (6-4, 6-3) del partido"
    );
  });

  it("returns correct quick confirm button text depending on isConfirming state", () => {
    expect(getMatchQuickConfirmButtonText(true)).toBe("Confirmando...");
    expect(getMatchQuickConfirmButtonText(false)).toBe("Confirmar");
  });

  it("returns correct UI texts for sharing, detail links, separators, placeholders and player names", () => {
    expect(getMatchShareTitle()).toBe("Resultado de Pádel");
    expect(getMatchShareButtonAriaLabel()).toBe("Compartir resultado");
    expect(getMatchDetailLinkText()).toBe("Detalle");
    expect(getMatchVersusSeparatorText()).toBe("vs");
    expect(getMatchScorePlaceholderText()).toBe("—");
    expect(getMatchTeamPlayerNameText(true, "Agustín Tapia")).toBe("Vos");
    expect(getMatchTeamPlayerNameText(false, "Agustín Tapia")).toBe("Agustín Tapia");
  });

  it("returns correct status badge text based on status and needsConfirmation flag", () => {
    expect(getMatchStatusBadgeText("PENDING", true)).toBe("Confirmar");
    expect(getMatchStatusBadgeText("PENDING", false)).toBe("Pendiente");
    expect(getMatchStatusBadgeText("CONFIRMED", false)).toBe("Confirmado");
    expect(getMatchStatusBadgeText("DISPUTED", false)).toBe("Disputa");
    expect(getMatchStatusBadgeText("CUSTOM_STATUS", false)).toBe("CUSTOM_STATUS");
  });

  it("returns correct status badge variant based on status and needsConfirmation flag", () => {
    expect(getMatchStatusBadgeVariant("PENDING", true)).toBe("primary");
    expect(getMatchStatusBadgeVariant("CONFIRMED", false)).toBe("success");
    expect(getMatchStatusBadgeVariant("DISPUTED", false)).toBe("warning");
    expect(getMatchStatusBadgeVariant("PENDING", false)).toBe("default");
    expect(getMatchStatusBadgeVariant("OTHER", false)).toBe("default");
  });

  it("returns correct ARIA label for detail link", () => {
    expect(getMatchDetailLinkAriaLabel(null)).toBe("Ver detalle del partido");
    expect(getMatchDetailLinkAriaLabel("")).toBe("Ver detalle del partido");
    expect(getMatchDetailLinkAriaLabel("15/10/26")).toBe("Ver detalle del partido del 15/10/26");
  });

  it("returns correct side title and display label", () => {
    expect(getMatchPlayerSideLabel("RIGHT")).toEqual({
      title: "Lado derecho",
      label: "Der",
    });
    expect(getMatchPlayerSideLabel("LEFT")).toEqual({
      title: "Lado revés",
      label: "Rev",
    });
  });

  it("returns correct ARIA label for player avatar and region landmark", () => {
    expect(getMatchPlayerAvatarAriaLabel("Agustín Tapia")).toBe("Ver perfil de Agustín Tapia");
    expect(getMatchResultCardRegionAriaLabel("Final del Torneo")).toBe(
      "Tarjeta de resultado: Final del Torneo"
    );
  });

  it("returns correct CSS classes for MatchResultCard container, header, title, content, and footer", () => {
    expect(getMatchResultCardContainerClasses()).toContain("rounded-xl border border-border bg-card shadow-xs");
    expect(getMatchResultCardHeaderClasses()).toContain("border-b border-border px-4 py-2");
    expect(getMatchResultCardTitleClasses()).toContain("text-xs font-semibold text-muted-foreground");
    expect(getMatchResultCardContentClasses()).toContain("p-4 text-sm text-muted-foreground");
    expect(getMatchResultCardFooterClasses()).toContain("border-t border-border px-4 py-3");
  });

  it("returns correct CSS classes for quick confirm button, share button, and detail link", () => {
    expect(getMatchQuickConfirmButtonClasses()).toContain("bg-primary text-primary-foreground");
    expect(getMatchShareButtonClasses()).toContain("h-8 w-8 rounded-lg text-primary hover:bg-muted");
    expect(getMatchDetailLinkClasses()).toContain("text-primary hover:underline");
  });

  it("returns correct CSS classes for team container, player avatar, player name, side badge, score segment, and versus divider", () => {
    expect(getMatchTeamContainerClasses(true)).toContain("bg-muted/80 font-medium");
    expect(getMatchTeamContainerClasses(false)).not.toContain("bg-muted/80");

    expect(getMatchPlayerAvatarClasses(0)).toContain("ml-0");
    expect(getMatchPlayerAvatarClasses(1)).toContain("-ml-2");

    expect(getMatchPlayerNameClasses(true)).toBe("truncate hover:text-primary text-primary");
    expect(getMatchPlayerNameClasses(false)).toBe("truncate hover:text-primary");

    expect(getMatchSideBadgeClasses()).toContain("inline-flex items-center shrink-0");
    expect(getMatchSideBadgeClasses()).toContain("bg-muted");

    expect(getMatchScoreSegmentClasses(true, true)).toContain("bg-primary text-primary-foreground");
    expect(getMatchScoreSegmentClasses(true, false)).toContain("bg-muted text-muted-foreground");
    expect(getMatchScoreSegmentClasses(false, false)).toContain("bg-muted text-muted-foreground/60");

    expect(getMatchVersusDividerClasses()).toContain("flex items-center gap-2 py-0.5");
  });
});
