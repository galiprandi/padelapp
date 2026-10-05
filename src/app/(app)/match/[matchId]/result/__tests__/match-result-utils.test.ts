import { describe, it, expect } from "vitest";
import {
  parseInitialScores,
  buildScoreString,
  extractMatchTeams,
  calculateTeammateSide,
  getMatchResultAriaLabel,
  getMatchResultSaveSuccessToast,
  getMatchResultSaveErrorToast,
  getMatchResultSubmitButtonText,
  getSetScoresSectionAriaLabel,
  getTeamSetScoreRadioGroupAriaLabel,
  getTeamSetScoreRadioAriaLabel,
  getPlayerSidesSectionAriaLabel,
  getPlayerSideRadioGroupAriaLabel,
  mapAttendancePlayers,
  MatchPlayerInput,
} from "../match-result-utils";

describe("match-result-utils", () => {
  describe("parseInitialScores", () => {
    it("returns default zero matrix when scoreStr is null or empty", () => {
      expect(parseInitialScores(null, 3)).toEqual([
        [0, 0],
        [0, 0],
        [0, 0],
      ]);
      expect(parseInitialScores("", 2)).toEqual([
        [0, 0],
        [0, 0],
      ]);
    });

    it("correctly parses valid score string with comma separator", () => {
      expect(parseInitialScores("6-4, 3-6, 7-6", 3)).toEqual([
        [6, 4],
        [3, 6],
        [7, 6],
      ]);
    });

    it("pads missing sets with zero pairs up to setsCount", () => {
      expect(parseInitialScores("6-4", 3)).toEqual([
        [6, 4],
        [0, 0],
        [0, 0],
      ]);
    });

    it("handles invalid or partial numbers gracefully", () => {
      expect(parseInitialScores("6-a, invalid", 2)).toEqual([
        [6, 0],
        [0, 0],
      ]);
    });
  });

  describe("buildScoreString", () => {
    it("formats scores matrix into comma-separated string", () => {
      const scores = [
        [6, 4],
        [3, 6],
        [7, 6],
      ];
      expect(buildScoreString(scores, 3)).toEqual("6-4, 3-6, 7-6");
    });

    it("limits output to setsCount", () => {
      const scores = [
        [6, 4],
        [3, 6],
        [7, 6],
      ];
      expect(buildScoreString(scores, 2)).toEqual("6-4, 3-6");
    });

    it("handles zero or default values", () => {
      expect(buildScoreString([[0, 0]], 1)).toEqual("0-0");
    });
  });

  describe("extractMatchTeams", () => {
    it("groups players by teamId correctly", () => {
      const players: MatchPlayerInput[] = [
        {
          id: "p1",
          position: 0,
          userId: "u1",
          displayName: "Agustín Tapia",
          teamId: "team-a",
          resultConfirmed: true,
          team: { id: "team-a", label: "Pareja Tapia" },
          user: { id: "u1", displayName: "Agustín Tapia", image: "/tapia.jpg" },
        },
        {
          id: "p2",
          position: 1,
          userId: "u2",
          displayName: "Arturo Coello",
          teamId: "team-a",
          resultConfirmed: true,
          team: { id: "team-a", label: "Pareja Tapia" },
        },
        {
          id: "p3",
          position: 2,
          userId: "u3",
          displayName: "Ale Galán",
          teamId: "team-b",
          resultConfirmed: false,
        },
      ];

      const teams = extractMatchTeams(players);
      expect(teams).toHaveLength(2);
      expect(teams[0].id).toEqual("team-a");
      expect(teams[0].label).toEqual("Pareja Tapia");
      expect(teams[0].players).toHaveLength(2);
      expect(teams[0].players[0].name).toEqual("Agustín Tapia");
      expect(teams[0].players[0].image).toEqual("/tapia.jpg");

      expect(teams[1].id).toEqual("team-b");
      expect(teams[1].label).toEqual("Equipo am-b");
      expect(teams[1].players[0].name).toEqual("Ale Galán");
    });
  });

  describe("calculateTeammateSide", () => {
    it("returns LEFT when current player selects RIGHT", () => {
      expect(calculateTeammateSide("RIGHT")).toBe("LEFT");
    });

    it("returns RIGHT when current player selects LEFT", () => {
      expect(calculateTeammateSide("LEFT")).toBe("RIGHT");
    });

    it("returns null when current player side is null", () => {
      expect(calculateTeammateSide(null)).toBeNull();
    });
  });

  describe("getMatchResultAriaLabel", () => {
    it("returns open form ARIA label when match is not closed", () => {
      const label = getMatchResultAriaLabel("Pareja A", "Pareja B", false);
      expect(label).toBe("Formulario para cargar marcador del partido entre Pareja A y Pareja B");
    });

    it("returns closed match ARIA label with score when closed", () => {
      const label = getMatchResultAriaLabel("Pareja A", "Pareja B", true, "6-4, 6-3");
      expect(label).toBe("Resultado confirmado del partido entre Pareja A y Pareja B: 6-4, 6-3");
    });
  });

  describe("toast and button text helpers", () => {
    it("getMatchResultSaveSuccessToast returns correct message", () => {
      expect(getMatchResultSaveSuccessToast()).toBe("Guardaste el resultado.");
    });

    it("getMatchResultSaveErrorToast returns provided message or default fallback", () => {
      expect(getMatchResultSaveErrorToast("Error personalizado")).toBe("Error personalizado");
      expect(getMatchResultSaveErrorToast()).toBe("No pudimos guardar el resultado.");
    });

    it("getMatchResultSubmitButtonText returns proper text based on pending state", () => {
      expect(getMatchResultSubmitButtonText(true)).toBe("Guardando...");
      expect(getMatchResultSubmitButtonText(false)).toBe("Registrar Resultado");
    });
  });

  describe("ARIA label helpers", () => {
    it("getSetScoresSectionAriaLabel formats set section label", () => {
      expect(getSetScoresSectionAriaLabel(0)).toBe("Puntajes del Set 1");
      expect(getSetScoresSectionAriaLabel(2)).toBe("Puntajes del Set 3");
    });

    it("getTeamSetScoreRadioGroupAriaLabel formats radio group label", () => {
      expect(getTeamSetScoreRadioGroupAriaLabel("Pareja Tapia", 0)).toBe(
        "Puntaje de Pareja Tapia para Set 1",
      );
    });

    it("getTeamSetScoreRadioAriaLabel handles singular and plural games correctly", () => {
      expect(getTeamSetScoreRadioAriaLabel(1, "Pareja Tapia")).toBe(
        "1 juego para Pareja Tapia",
      );
      expect(getTeamSetScoreRadioAriaLabel(6, "Pareja Tapia")).toBe(
        "6 juegos para Pareja Tapia",
      );
    });

    it("getPlayerSidesSectionAriaLabel returns player side section label", () => {
      expect(getPlayerSidesSectionAriaLabel()).toBe(
        "Selección de posición en cancha por jugador",
      );
    });

    it("getPlayerSideRadioGroupAriaLabel formats player side radio group label", () => {
      expect(getPlayerSideRadioGroupAriaLabel("Agustín Tapia")).toBe(
        "Lado para Agustín Tapia",
      );
    });
  });

  describe("mapAttendancePlayers", () => {
    it("filters players without userId and maps valid players correctly", () => {
      const players: MatchPlayerInput[] = [
        {
          id: "p1",
          position: 0,
          userId: "u1",
          displayName: "Agustín Tapia",
          teamId: "team-a",
          resultConfirmed: true,
          attendance: "ATTENDED",
          user: { id: "u1", displayName: "Agustín Tapia", image: "/tapia.jpg" },
        },
        {
          id: "p2",
          position: 1,
          userId: null,
          displayName: "Placeholder Jugador 2",
          teamId: "team-a",
          resultConfirmed: false,
        },
      ];

      const mapped = mapAttendancePlayers(players);
      expect(mapped).toHaveLength(1);
      expect(mapped[0]).toEqual({
        id: "p1",
        userId: "u1",
        name: "Agustín Tapia",
        image: "/tapia.jpg",
        currentStatus: "ATTENDED",
      });
    });
  });
});
