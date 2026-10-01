import { describe, it, expect } from "vitest";
import {
  getAssignUserSuccessToast,
  getAssignUserErrorToast,
  getRenamePlaceholderSuccessToast,
  getRenamePlaceholderErrorToast,
  getShareInviteText,
  getCopyInviteSuccessToast,
  getCopyInviteErrorToast,
  getReleaseSlotSuccessToast,
  getReleaseSlotErrorToast,
  getSwapSelectPromptToast,
  getSwapSuccessToast,
  getSwapErrorToast,
  getSwapModeStatusAriaLabel,
  getSwapModeCancelAriaLabel,
  getMatchTeamsRegionAriaLabel,
  getPlayerManageAriaLabel,
} from "../match-players-manager-utils";

describe("match-players-manager-utils", () => {
  describe("getAssignUserSuccessToast", () => {
    it("returns formatted success toast with player display name", () => {
      expect(getAssignUserSuccessToast("Agustín Tapia")).toBe(
        "Asignaste a Agustín Tapia al partido."
      );
    });
  });

  describe("getAssignUserErrorToast", () => {
    it("returns custom message when provided", () => {
      expect(getAssignUserErrorToast("El usuario ya está asignado.")).toBe(
        "El usuario ya está asignado."
      );
    });

    it("returns fallback error message when message is null or undefined", () => {
      expect(getAssignUserErrorToast(null)).toBe("No pudimos asignar al jugador.");
      expect(getAssignUserErrorToast(undefined)).toBe("No pudimos asignar al jugador.");
    });
  });

  describe("getRenamePlaceholderSuccessToast", () => {
    it("returns standard rename success message in voseo", () => {
      expect(getRenamePlaceholderSuccessToast()).toBe("Actualizaste el jugador.");
    });
  });

  describe("getRenamePlaceholderErrorToast", () => {
    it("returns custom message when provided", () => {
      expect(getRenamePlaceholderErrorToast("Nombre inválido.")).toBe("Nombre inválido.");
    });

    it("returns fallback error message when message is null or undefined", () => {
      expect(getRenamePlaceholderErrorToast(null)).toBe("No pudimos actualizar el jugador.");
      expect(getRenamePlaceholderErrorToast(undefined)).toBe("No pudimos actualizar el jugador.");
    });
  });

  describe("getShareInviteText", () => {
    it("returns formatted invite text for share intent", () => {
      expect(getShareInviteText("Jugador 2")).toBe("Sumate al partido como Jugador 2");
    });
  });

  describe("getCopyInviteSuccessToast & getCopyInviteErrorToast", () => {
    it("returns correct copy link toasts", () => {
      expect(getCopyInviteSuccessToast()).toBe("Copiaste el enlace.");
      expect(getCopyInviteErrorToast()).toBe("No pudimos copiar el enlace.");
    });
  });

  describe("getReleaseSlotSuccessToast & getReleaseSlotErrorToast", () => {
    it("returns release slot success toast", () => {
      expect(getReleaseSlotSuccessToast()).toBe("Liberaste el cupo.");
    });

    it("returns release slot error toast with custom message or fallback", () => {
      expect(getReleaseSlotErrorToast("Cupo bloqueado.")).toBe("Cupo bloqueado.");
      expect(getReleaseSlotErrorToast(null)).toBe("No pudimos liberar el cupo.");
    });
  });

  describe("getSwapSelectPromptToast, getSwapSuccessToast & getSwapErrorToast", () => {
    it("returns swap prompt toast", () => {
      expect(getSwapSelectPromptToast()).toBe("Seleccioná el otro jugador para intercambiar.");
    });

    it("returns swap success toast", () => {
      expect(getSwapSuccessToast()).toBe("Intercambiaste las posiciones.");
    });

    it("returns swap error toast with custom message or fallback", () => {
      expect(getSwapErrorToast("Partido no pendiente.")).toBe("Partido no pendiente.");
      expect(getSwapErrorToast(null)).toBe("No pudimos realizar el cambio.");
    });
  });

  describe("Accessibility ARIA labels", () => {
    it("returns correct swap mode status ARIA label", () => {
      expect(getSwapModeStatusAriaLabel()).toBe(
        "Modo intercambio activo. Seleccioná otro jugador o presioná Escape para cancelar."
      );
    });

    it("returns correct swap mode cancel button ARIA label", () => {
      expect(getSwapModeCancelAriaLabel()).toBe("Cancelar intercambio de posición");
    });

    it("returns correct match teams region ARIA label", () => {
      expect(getMatchTeamsRegionAriaLabel()).toBe("Alineación y parejas del partido");
    });

    it("returns correct player manage button ARIA label", () => {
      expect(getPlayerManageAriaLabel("Bela")).toBe("Gestionar jugador Bela");
    });
  });
});
