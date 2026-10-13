import { describe, it, expect } from "vitest";
import {
  getCancelMatchButtonText,
  getCancelMatchConfirmButtonText,
  getCancelMatchAriaLabel,
  getCancelMatchConfirmRegionAriaLabel,
  getCancelMatchCancelAriaLabel,
  getCancelMatchSubmitAriaLabel,
  getCancelMatchSuccessToast,
  getCancelMatchErrorToast,
  getConfirmResultButtonText,
  getConfirmResultRegionAriaLabel,
  getConfirmResultAriaLabel,
  getConfirmResultSuccessToast,
  getConfirmResultErrorToast,
  getFinalizeMatchButtonText,
  getFinalizeMatchRegionAriaLabel,
  getFinalizeMatchAriaLabel,
  getFinalizeMatchSuccessToast,
  getFinalizeMatchErrorToast,
} from "../match-actions-utils";

describe("Match Actions Utils", () => {
  describe("Cancel Match Helpers", () => {
    it("returns correct trigger button text", () => {
      expect(getCancelMatchButtonText()).toBe("Eliminar Partido");
    });

    it("returns correct confirmation button text based on pending state", () => {
      expect(getCancelMatchConfirmButtonText(false)).toBe("Confirmar");
      expect(getCancelMatchConfirmButtonText(true)).toBe("Eliminando...");
    });

    it("returns correct trigger aria-label", () => {
      expect(getCancelMatchAriaLabel()).toBe("Eliminar este partido");
    });

    it("returns correct confirmation region aria-label", () => {
      expect(getCancelMatchConfirmRegionAriaLabel()).toBe("Confirmación de eliminación del partido");
    });

    it("returns correct cancel button aria-label", () => {
      expect(getCancelMatchCancelAriaLabel()).toBe("Cancelar eliminación del partido");
    });

    it("returns correct submit button aria-label based on pending state", () => {
      expect(getCancelMatchSubmitAriaLabel(false)).toBe("Confirmar eliminación del partido");
      expect(getCancelMatchSubmitAriaLabel(true)).toBe("Eliminando partido...");
    });

    it("returns correct success toast message", () => {
      expect(getCancelMatchSuccessToast()).toBe("Eliminaste el partido.");
    });

    it("returns correct error toast message", () => {
      expect(getCancelMatchErrorToast()).toBe("No pudimos eliminar el partido.");
      expect(getCancelMatchErrorToast("Error personalizado")).toBe("Error personalizado");
    });
  });

  describe("Confirm Result Helpers", () => {
    it("returns correct confirm result button text based on pending state", () => {
      expect(getConfirmResultButtonText(false)).toBe("Confirmar Resultado");
      expect(getConfirmResultButtonText(true)).toBe("Confirmando...");
    });

    it("returns correct confirm result region aria-label", () => {
      expect(getConfirmResultRegionAriaLabel()).toBe("Acción para confirmar resultado del partido");
    });

    it("returns correct confirm result button aria-label based on pending state", () => {
      expect(getConfirmResultAriaLabel(false)).toBe("Confirmar resultado del partido");
      expect(getConfirmResultAriaLabel(true)).toBe("Confirmando resultado del partido...");
    });

    it("returns correct success toast message", () => {
      expect(getConfirmResultSuccessToast()).toBe("Confirmaste el resultado. 🏆");
    });

    it("returns correct error toast message", () => {
      expect(getConfirmResultErrorToast()).toBe("No pudimos confirmar el resultado.");
      expect(getConfirmResultErrorToast("Servidor no disponible")).toBe("Servidor no disponible");
    });
  });

  describe("Finalize Match Helpers", () => {
    it("returns correct finalize match button text based on pending state", () => {
      expect(getFinalizeMatchButtonText(false)).toBe("Finalizar como Organizador");
      expect(getFinalizeMatchButtonText(true)).toBe("Finalizando...");
    });

    it("returns correct finalize match region aria-label", () => {
      expect(getFinalizeMatchRegionAriaLabel()).toBe("Acción para finalizar partido como organizador");
    });

    it("returns correct finalize match button aria-label based on pending state", () => {
      expect(getFinalizeMatchAriaLabel(false)).toBe("Finalizar el partido como organizador");
      expect(getFinalizeMatchAriaLabel(true)).toBe("Finalizando partido...");
    });

    it("returns correct success toast message", () => {
      expect(getFinalizeMatchSuccessToast()).toBe("Finalizaste el partido. 🏆");
    });

    it("returns correct error toast message", () => {
      expect(getFinalizeMatchErrorToast()).toBe("No pudimos finalizar el partido.");
      expect(getFinalizeMatchErrorToast("Permiso denegado")).toBe("Permiso denegado");
    });
  });
});
