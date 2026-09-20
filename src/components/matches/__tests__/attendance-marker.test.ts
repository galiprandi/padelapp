import { describe, it, expect } from "vitest";
import {
  getAttendanceStatusAriaLabel,
  getPlayerFeedbackAriaLabel,
  getAttendanceSummaryText,
  getAttendanceBadgeLabel,
  getAttendanceBadgeClasses,
  getAttendanceBadgeAriaLabel,
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
});
