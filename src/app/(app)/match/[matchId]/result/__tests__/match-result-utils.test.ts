import { describe, it, expect } from "vitest";
import {
  parseInitialScores,
  buildScoreString,
  extractMatchTeams,
  calculateTeammateSide,
  getMatchResultAriaLabel,
  getMatchResultSkeletonAriaLabel,
  getSaveMatchResultSuccessToast,
  getSaveMatchResultErrorToast,
  getFinalScoreRegionAriaLabel,
  getSetScoresRegionAriaLabel,
  getPlayerSidesRegionAriaLabel,
  getPlayerSideGroupAriaLabel,
  getSetScoreButtonAriaLabel,
  getSetScoreGroupAriaLabel,
  getRegisterScorePrimaryButtonText,
  getCancelScoreSecondaryButtonText,
  getConfirmedMatchTitle,
  getBackToDetailButtonText,
  getSetHeaderTitle,
  getPlayerSidesHeadingTitle,
  getSideOptionButtonLabel,
  getSideOptionButtonClasses,
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

  describe("getMatchResultSkeletonAriaLabel", () => {
    it("returns expected skeleton ARIA label", () => {
      expect(getMatchResultSkeletonAriaLabel()).toBe("Cargando formulario de resultado del partido...");
    });
  });

  describe("newly extracted match result helper functions", () => {
    it("returns correct save match result success toast", () => {
      expect(getSaveMatchResultSuccessToast()).toBe("Guardaste el resultado.");
    });

    it("returns correct save match result error toast", () => {
      expect(getSaveMatchResultErrorToast("Error al guardar")).toBe("Error al guardar");
      expect(getSaveMatchResultErrorToast()).toBe("No pudimos guardar el resultado.");
      expect(getSaveMatchResultErrorToast("   ")).toBe("No pudimos guardar el resultado.");
    });

    it("returns correct final score region ARIA label", () => {
      expect(getFinalScoreRegionAriaLabel("6-4, 6-3")).toBe("Resultado final del partido: 6-4, 6-3");
    });

    it("returns correct set scores region ARIA label", () => {
      expect(getSetScoresRegionAriaLabel(0)).toBe("Puntajes del Set 1");
      expect(getSetScoresRegionAriaLabel(1)).toBe("Puntajes del Set 2");
    });

    it("returns correct player sides region ARIA label", () => {
      expect(getPlayerSidesRegionAriaLabel()).toBe("Selección de posición en cancha por jugador");
    });

    it("returns correct player side group ARIA label", () => {
      expect(getPlayerSideGroupAriaLabel("Agustín Tapia")).toBe("Lado para Agustín Tapia");
    });

    it("returns correct set score button ARIA label", () => {
      expect(getSetScoreButtonAriaLabel(6, "Pareja A")).toBe("6 juegos para Pareja A");
    });

    it("returns correct set score group ARIA label", () => {
      expect(getSetScoreGroupAriaLabel("Pareja A", 0)).toBe("Puntaje de Pareja A para Set 1");
    });

    it("returns correct register score primary button text", () => {
      expect(getRegisterScorePrimaryButtonText(true)).toBe("Guardando...");
      expect(getRegisterScorePrimaryButtonText(false)).toBe("Registrar Resultado");
    });

    it("returns correct cancel score secondary button text", () => {
      expect(getCancelScoreSecondaryButtonText()).toBe("Cancelar");
    });

    it("returns correct confirmed match title", () => {
      expect(getConfirmedMatchTitle()).toBe("Partido ya confirmado");
    });

    it("returns correct back to detail button text", () => {
      expect(getBackToDetailButtonText()).toBe("Volver al detalle");
    });

    it("returns correct set header title", () => {
      expect(getSetHeaderTitle(0)).toBe("Set 1");
      expect(getSetHeaderTitle(1)).toBe("Set 2");
    });

    it("returns correct player sides heading title", () => {
      expect(getPlayerSidesHeadingTitle()).toBe("Posición en cancha (Derecha / Revés)");
    });

    it("returns correct side option button labels", () => {
      expect(getSideOptionButtonLabel("RIGHT")).toBe("Derecha");
      expect(getSideOptionButtonLabel("LEFT")).toBe("Revés");
    });

    it("generates correct solid MDS CSS classes for side option buttons", () => {
      const selectedClasses = getSideOptionButtonClasses(true);
      expect(selectedClasses).toContain("bg-background text-foreground shadow-xs");

      const unselectedClasses = getSideOptionButtonClasses(false);
      expect(unselectedClasses).toContain("text-muted-foreground hover:text-foreground");
    });
  });
});
