import { describe, it, expect } from "vitest";
import {
  getMatchQuickConfirmSuccessToast,
  getMatchQuickConfirmErrorToast,
  getMatchQuickConfirmButtonAriaLabel,
  getMatchStatusBadgeText,
  getMatchStatusBadgeVariant,
  getMatchDetailLinkAriaLabel,
  getMatchPlayerSideLabel,
  getMatchPlayerAvatarAriaLabel,
  getMatchResultCardRegionAriaLabel,
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
});
