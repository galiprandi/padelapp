import { describe, it, expect } from "vitest";
import {
  getAttendanceStatusAriaLabel,
  getPlayerFeedbackAriaLabel,
  getAttendanceSummaryText,
  getAttendanceBadgeLabel,
  getAttendanceBadgeClasses,
  getAttendanceBadgeAriaLabel,
  getAttendanceSaveSuccessToast,
  getAttendanceSaveErrorToast,
  getAttendanceSaveButtonLabel,
  getAttendanceSaveButtonAriaLabel,
  getAttendanceSectionRegionAriaLabel,
  getPlayerFeedbackHeadingText,
  getPlayerFeedbackSectionAriaLabel,
  getFeedbackOptionButtonLabel,
  getFeedbackOptionClasses,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_BADGE_CLASSES,
} from "../attendance-utils";

describe("attendance-utils", () => {
  describe("getAttendanceBadgeLabel", () => {
    it("returns empty string when status is null", () => {
      expect(getAttendanceBadgeLabel(null)).toBe("");
    });

    it("returns correct status labels for each attendance state", () => {
      expect(getAttendanceBadgeLabel("ATTENDED")).toBe("Presente");
      expect(getAttendanceBadgeLabel("LATE")).toBe("Tarde");
      expect(getAttendanceBadgeLabel("NO_SHOW")).toBe("No asistió");
    });
  });

  describe("getAttendanceBadgeClasses", () => {
    it("returns empty string when status is null", () => {
      expect(getAttendanceBadgeClasses(null)).toBe("");
    });

    it("returns solid MDS badge styling classes for each status", () => {
      expect(getAttendanceBadgeClasses("ATTENDED")).toContain("bg-emerald-100");
      expect(getAttendanceBadgeClasses("LATE")).toContain("bg-amber-100");
      expect(getAttendanceBadgeClasses("NO_SHOW")).toContain("bg-rose-100");
    });
  });

  describe("getAttendanceBadgeAriaLabel", () => {
    it("returns empty string when status is null", () => {
      expect(getAttendanceBadgeAriaLabel(null)).toBe("");
    });

    it("formats screen reader ARIA label for status badge", () => {
      expect(getAttendanceBadgeAriaLabel("ATTENDED")).toBe("Asistencia: Presente");
      expect(getAttendanceBadgeAriaLabel("LATE")).toBe("Asistencia: Tarde");
      expect(getAttendanceBadgeAriaLabel("NO_SHOW")).toBe("Asistencia: No asistió");
    });
  });

  describe("getAttendanceStatusAriaLabel", () => {
    it("formats attendance status ARIA labels correctly in Spanish", () => {
      expect(getAttendanceStatusAriaLabel("ATTENDED", "Agustín Tapia")).toBe(
        "Presente - Agustín Tapia",
      );
      expect(getAttendanceStatusAriaLabel("LATE", "Arturo Coello")).toBe(
        "Tarde - Arturo Coello",
      );
      expect(getAttendanceStatusAriaLabel("NO_SHOW", "Belén Bela")).toBe(
        "No asistió - Belén Bela",
      );
    });
  });

  describe("getPlayerFeedbackAriaLabel", () => {
    it("formats stronger level feedback ARIA label", () => {
      expect(getPlayerFeedbackAriaLabel("STRONGER", "Agustín Tapia")).toBe(
        "Calificar a Agustín Tapia como más fuerte",
      );
    });

    it("formats weaker level feedback ARIA label", () => {
      expect(getPlayerFeedbackAriaLabel("WEAKER", "Arturo Coello")).toBe(
        "Calificar a Arturo Coello como más flojo",
      );
    });
  });

  describe("getAttendanceSummaryText", () => {
    it("returns default summary when totalPlayers is 0 or negative", () => {
      expect(getAttendanceSummaryText(0)).toBe(
        "Confirmá la asistencia y calificá sutilmente el nivel de los jugadores.",
      );
      expect(getAttendanceSummaryText(-1)).toBe(
        "Confirmá la asistencia y calificá sutilmente el nivel de los jugadores.",
      );
    });

    it("formats singular player summary when totalPlayers is 1", () => {
      expect(getAttendanceSummaryText(1)).toBe(
        "Confirmá la asistencia de 1 jugador y calificá sutilmente su nivel.",
      );
    });

    it("formats plural players summary when totalPlayers > 1", () => {
      expect(getAttendanceSummaryText(4)).toBe(
        "Confirmá la asistencia de 4 jugadores y calificá sutilmente su nivel.",
      );
    });
  });

  describe("ATTENDANCE_STATUS_LABELS & ATTENDANCE_BADGE_CLASSES", () => {
    it("defines proper status label and badge class mappings", () => {
      expect(ATTENDANCE_STATUS_LABELS.ATTENDED).toBe("Presente");
      expect(ATTENDANCE_STATUS_LABELS.LATE).toBe("Tarde");
      expect(ATTENDANCE_STATUS_LABELS.NO_SHOW).toBe("No asistió");
      expect(ATTENDANCE_BADGE_CLASSES.ATTENDED).toBeDefined();
    });
  });

  describe("getAttendanceSaveSuccessToast", () => {
    it("returns toast message when feedback was saved successfully", () => {
      expect(getAttendanceSaveSuccessToast(true)).toBe(
        "Guardaste la asistencia y el feedback.",
      );
    });

    it("returns partial toast message when feedback could not be saved", () => {
      expect(getAttendanceSaveSuccessToast(false)).toBe(
        "Guardaste la asistencia, pero no pudimos registrar tu feedback.",
      );
    });
  });

  describe("getAttendanceSaveErrorToast", () => {
    it("returns fallback message when provided", () => {
      expect(getAttendanceSaveErrorToast("Error en servidor")).toBe("Error en servidor");
    });

    it("returns default message when fallbackMessage is missing or empty", () => {
      expect(getAttendanceSaveErrorToast()).toBe("No pudimos guardar la asistencia.");
      expect(getAttendanceSaveErrorToast("   ")).toBe("No pudimos guardar la asistencia.");
    });
  });

  describe("getAttendanceSaveButtonLabel", () => {
    it("returns pending state label when pending", () => {
      expect(getAttendanceSaveButtonLabel(true)).toBe("Guardando asistencia...");
    });

    it("returns default action label when not pending", () => {
      expect(getAttendanceSaveButtonLabel(false)).toBe("Guardar asistencia y feedback");
    });
  });

  describe("getAttendanceSaveButtonAriaLabel", () => {
    it("returns accessible ARIA label for pending state", () => {
      expect(getAttendanceSaveButtonAriaLabel(true)).toBe(
        "Guardando asistencia y feedback de nivel de los jugadores",
      );
    });

    it("returns accessible ARIA label for idle state", () => {
      expect(getAttendanceSaveButtonAriaLabel(false)).toBe(
        "Guardar asistencia y feedback de nivel de los jugadores",
      );
    });
  });

  describe("newly extracted attendance helper functions", () => {
    it("returns correct region landmark ARIA label", () => {
      expect(getAttendanceSectionRegionAriaLabel()).toBe(
        "Control de asistencia y feedback de nivel de los jugadores",
      );
    });

    it("returns correct player feedback heading text", () => {
      expect(getPlayerFeedbackHeadingText()).toBe("Nivel vs. el grupo (opcional):");
    });

    it("returns correct player feedback section ARIA label", () => {
      expect(getPlayerFeedbackSectionAriaLabel("Agustín Tapia")).toBe(
        "Nivel de Agustín Tapia comparado con el grupo",
      );
    });

    it("returns correct feedback option button labels", () => {
      expect(getFeedbackOptionButtonLabel("STRONGER")).toBe("Más fuerte 💪");
      expect(getFeedbackOptionButtonLabel("WEAKER")).toBe("Más flojo 📉");
    });

    it("generates correct MDS button CSS classes for unselected state", () => {
      const classes = getFeedbackOptionClasses(false, "STRONGER");
      expect(classes).toContain("border-border bg-card text-muted-foreground");
    });

    it("generates correct MDS button CSS classes for selected STRONGER state", () => {
      const classes = getFeedbackOptionClasses(true, "STRONGER");
      expect(classes).toContain("bg-emerald-100 text-emerald-800");
    });

    it("generates correct MDS button CSS classes for selected WEAKER state", () => {
      const classes = getFeedbackOptionClasses(true, "WEAKER");
      expect(classes).toContain("bg-amber-100 text-amber-800");
    });
  });
});
