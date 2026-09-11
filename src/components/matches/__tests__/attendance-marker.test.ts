import { describe, it, expect } from "vitest";
import {
  getAttendanceStatusAriaLabel,
  getPlayerFeedbackAriaLabel,
  getAttendanceSummaryText,
  ATTENDANCE_STATUS_LABELS,
} from "../attendance-utils";

describe("attendance-utils", () => {
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

  describe("ATTENDANCE_STATUS_LABELS", () => {
    it("defines proper status label mappings", () => {
      expect(ATTENDANCE_STATUS_LABELS.ATTENDED).toBe("Presente");
      expect(ATTENDANCE_STATUS_LABELS.LATE).toBe("Tarde");
      expect(ATTENDANCE_STATUS_LABELS.NO_SHOW).toBe("No asistió");
    });
  });
});
