import { describe, it, expect } from "vitest";
import {
  getMatchTypeLabel,
  validateEditMatchFormData,
  getEditMatchRegionAriaLabel,
  getEditMatchSuccessToast,
  getEditMatchErrorToast,
  getEditMatchSubmitAriaLabel,
} from "../edit-match-utils";

describe("edit-match-utils", () => {
  describe("getMatchTypeLabel", () => {
    it("returns 'amistoso' for FRIENDLY or empty values", () => {
      expect(getMatchTypeLabel("FRIENDLY")).toBe("amistoso");
      expect(getMatchTypeLabel(null)).toBe("amistoso");
      expect(getMatchTypeLabel(undefined)).toBe("amistoso");
    });

    it("returns 'torneo' for LOCAL_TOURNAMENT", () => {
      expect(getMatchTypeLabel("LOCAL_TOURNAMENT")).toBe("torneo");
    });

    it("returns lowercase string for custom match types", () => {
      expect(getMatchTypeLabel("EXHIBITION")).toBe("exhibition");
    });
  });

  describe("validateEditMatchFormData", () => {
    it("returns valid result for valid form data", () => {
      const result = validateEditMatchFormData({
        club: "Club Central",
        sets: "3",
        notes: "Partido amigable",
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("returns error when notes exceed 200 characters", () => {
      const result = validateEditMatchFormData({
        notes: "a".repeat(201),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "notes",
        message: "Las notas no pueden superar los 200 caracteres.",
      });
    });

    it("returns error when sets is invalid number", () => {
      const result = validateEditMatchFormData({
        sets: "-1",
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "sets",
        message: "La cantidad de sets debe ser un número válido.",
      });
    });
  });

  describe("getEditMatchRegionAriaLabel", () => {
    it("returns expected region labels in Argentine Spanish", () => {
      expect(getEditMatchRegionAriaLabel("form")).toBe(
        "Formulario para editar detalles del partido",
      );
      expect(getEditMatchRegionAriaLabel("location")).toBe(
        "Ubicación y horario del partido",
      );
      expect(getEditMatchRegionAriaLabel("format")).toBe(
        "Formato y tipo de partido",
      );
      expect(getEditMatchRegionAriaLabel("notes")).toBe(
        "Notas adicionales del partido",
      );
      expect(getEditMatchRegionAriaLabel("header")).toBe(
        "Encabezado y estado del partido",
      );
      expect(getEditMatchRegionAriaLabel("details")).toBe(
        "Ubicación y organizador del partido",
      );
      expect(getEditMatchRegionAriaLabel("actions")).toBe(
        "Acciones disponibles del partido",
      );
      expect(getEditMatchRegionAriaLabel("summary")).toBe(
        "Resumen del resultado final",
      );
      expect(getEditMatchRegionAriaLabel("confirmations")).toBe(
        "Estado de confirmaciones de resultado",
      );
      expect(getEditMatchRegionAriaLabel("attendance")).toBe(
        "Registro de asistencia de jugadores",
      );
      expect(getEditMatchRegionAriaLabel("teams")).toBe(
        "Formación de equipos del partido",
      );
    });
  });

  describe("getEditMatchSuccessToast", () => {
    it("returns localized success toast text", () => {
      expect(getEditMatchSuccessToast()).toBe(
        "Actualizaste el partido con éxito.",
      );
    });
  });

  describe("getEditMatchErrorToast", () => {
    it("returns custom response message if present", () => {
      expect(getEditMatchErrorToast("El club especificado no existe.")).toBe(
        "El club especificado no existe.",
      );
    });

    it("returns fallback error message if null, empty, or whitespace", () => {
      expect(getEditMatchErrorToast(null)).toBe(
        "No pudimos actualizar el partido.",
      );
      expect(getEditMatchErrorToast("")).toBe(
        "No pudimos actualizar el partido.",
      );
      expect(getEditMatchErrorToast("   ")).toBe(
        "No pudimos actualizar el partido.",
      );
    });
  });

  describe("getEditMatchSubmitAriaLabel", () => {
    it("returns loading label when isPending is true", () => {
      expect(getEditMatchSubmitAriaLabel(true)).toBe(
        "Guardando cambios del partido...",
      );
    });

    it("returns default label when isPending is false", () => {
      expect(getEditMatchSubmitAriaLabel(false)).toBe(
        "Guardar cambios del partido",
      );
    });
  });
});
