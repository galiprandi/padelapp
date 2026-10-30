import { describe, it, expect } from "vitest";
import {
  getPublicProfileSideLabel,
  formatSideWinRateSummary,
  calculateWinningStreak,
  formatPartnerWinsText,
  formatRivalMatchesText,
  calculateRecentForm,
  getRecentFormAriaLabel,
  getStreakBadgeText,
  getWinRateAriaLabel,
  getPublicProfileBackAriaLabel,
  getPublicProfileHeaderAriaLabel,
  getPublicProfileShareTitle,
  getPublicProfileShareText,
  getNetworkPositionRegionAriaLabel,
  formatNetworkContactsCountText,
  getHeadToHeadRegionAriaLabel,
  formatH2HLastMatchResultText,
  getMatchHistoryRegionAriaLabel,
  getPublicProfileSkeletonAriaLabel,
  getPublicProfileHeaderTitle,
  getPublicProfileHeaderSubtitle,
  getMiniCourtIndicatorClasses,
  getRecentFormDotClasses,
  getPublicProfileWinRateLabel,
  getPublicProfileRecentFormLabel,
  getPublicProfileNetworkContactsLabel,
  getPublicProfilePreferredSideHeadingText,
  getPublicProfileSuccessfulPartnerLabel,
  getPublicProfileFrequentRivalLabel,
  getPublicProfileHeadToHeadHeadingText,
  getPublicProfileAsPartnersLabel,
  getPublicProfileAsRivalsLabel,
  getPublicProfileLastMatchLabel,
  getPublicProfileMatchHistoryHeadingText,
  getPublicProfileEmptyStateProps,
  getPublicProfileMainClasses,
  getPublicProfileHeaderClasses,
  getPublicProfileBackButtonClasses,
  getPublicProfileHeaderSkeletonClasses,
  getPublicProfileAvatarBadgeClasses,
  getPublicProfileStreakBadgeClasses,
  getPublicProfileStatCardClasses,
  getPublicProfileNetworkCardClasses,
  getPublicProfileNetworkBadgeClasses,
  getPublicProfileH2HCardClasses,
  getPublicProfileH2HResultClasses,
  getPublicProfileMiniCourtContainerClasses,
  getPublicProfileMiniCourtGridClasses,
  getPublicProfileShareButtonClasses,
  getPublicProfileSkeletonContainerClasses,
  getPublicProfileSkeletonSummaryClasses,
  getPublicProfileSkeletonBannerClasses,
  getPublicProfileSkeletonGridClasses,
  getPublicProfileSkeletonHistoryClasses,
} from "../public-profile-utils";

describe("public-profile-utils", () => {
  describe("getPublicProfileSideLabel", () => {
    it("returns 'Derecha' for RIGHT side preference", () => {
      expect(getPublicProfileSideLabel("RIGHT")).toBe("Derecha");
    });

    it("returns 'Revés' for LEFT side preference", () => {
      expect(getPublicProfileSideLabel("LEFT")).toBe("Revés");
    });

    it("returns 'Alterno' for BOTH or null side preference", () => {
      expect(getPublicProfileSideLabel("BOTH")).toBe("Alterno");
      expect(getPublicProfileSideLabel(null)).toBe("Alterno");
    });
  });

  describe("formatSideWinRateSummary", () => {
    it("formats right win rate only", () => {
      expect(formatSideWinRateSummary(0.75, null)).toBe("Der: 75% WR");
    });

    it("formats left win rate only", () => {
      expect(formatSideWinRateSummary(null, 0.6)).toBe("Rev: 60% WR");
    });

    it("formats both right and left win rates", () => {
      expect(formatSideWinRateSummary(0.8, 0.5)).toBe("Der: 80% WR Rev: 50% WR");
    });

    it("returns 'Sin partidos' when both win rates are null", () => {
      expect(formatSideWinRateSummary(null, null)).toBe("Sin partidos");
    });
  });

  describe("calculateWinningStreak", () => {
    it("returns 0 for empty array or initial loss", () => {
      expect(calculateWinningStreak([])).toBe(0);
      expect(calculateWinningStreak(["L", "W", "W"])).toBe(0);
    });

    it("calculates active winning streak from start of form array", () => {
      expect(calculateWinningStreak(["W", "W", "W", "L"])).toBe(3);
      expect(calculateWinningStreak(["W", "L", "W"])).toBe(1);
    });
  });

  describe("formatPartnerWinsText & formatRivalMatchesText", () => {
    it("formats singular and plural partner wins", () => {
      expect(formatPartnerWinsText(1)).toBe("1 victoria 🔥");
      expect(formatPartnerWinsText(5)).toBe("5 victorias 🔥");
    });

    it("formats singular and plural rival matches", () => {
      expect(formatRivalMatchesText(1)).toBe("1 partido ⚔️");
      expect(formatRivalMatchesText(4)).toBe("4 partidos ⚔️");
    });
  });

  describe("calculateRecentForm", () => {
    it("returns empty array for empty matches list", () => {
      expect(calculateRecentForm([], "user-1")).toEqual([]);
    });

    it("correctly identifies wins and losses based on player position and match score", () => {
      const mockMatches = [
        {
          score: "6-4 6-2",
          players: [
            { userId: "user-1", position: 0 },
            { userId: "user-2", position: 1 },
            { userId: "user-3", position: 2 },
            { userId: "user-4", position: 3 },
          ],
        },
        {
          score: "4-6 2-6",
          players: [
            { userId: "user-1", position: 0 },
            { userId: "user-2", position: 1 },
            { userId: "user-3", position: 2 },
            { userId: "user-4", position: 3 },
          ],
        },
        {
          score: null,
          players: [
            { userId: "user-1", position: 0 },
          ],
        },
      ];

      expect(calculateRecentForm(mockMatches, "user-1")).toEqual(["W", "L", "L"]);
    });
  });

  describe("getRecentFormAriaLabel", () => {
    it("returns 'Sin partidos' for empty form array", () => {
      expect(getRecentFormAriaLabel([])).toBe("Sin partidos");
    });

    it("formats results into localized Spanish ARIA string", () => {
      expect(getRecentFormAriaLabel(["W", "L", "W"])).toBe("Forma reciente: G, P, G");
    });
  });

  describe("getStreakBadgeText", () => {
    it("formats singular and plural streak text", () => {
      expect(getStreakBadgeText(1)).toBe("Racha: 1 Victoria 🔥");
      expect(getStreakBadgeText(3)).toBe("Racha: 3 Victorias 🔥");
    });
  });

  describe("getWinRateAriaLabel", () => {
    it("formats zero matches played label", () => {
      expect(getWinRateAriaLabel(0, 0)).toBe("Efectividad: 0% en 0 partidos");
    });

    it("formats singular and plural matches played win rate label", () => {
      expect(getWinRateAriaLabel(100, 1)).toBe("Efectividad: 100% en 1 partido");
      expect(getWinRateAriaLabel(75, 8)).toBe("Efectividad: 75% en 8 partidos");
    });
  });

  describe("new public profile pure helpers", () => {
    it("returns static back button ARIA label", () => {
      expect(getPublicProfileBackAriaLabel()).toBe("Volver atrás");
    });

    it("formats header ARIA label with fallback and custom display name", () => {
      expect(getPublicProfileHeaderAriaLabel(null)).toBe("Perfil y estadísticas de Jugador");
      expect(getPublicProfileHeaderAriaLabel("Agustín Tapia")).toBe("Perfil y estadísticas de Agustín Tapia");
    });

    it("formats share title and share text", () => {
      expect(getPublicProfileShareTitle("Fernando Belasteguín")).toBe("Perfil de Fernando Belasteguín");
      expect(getPublicProfileShareText("Fernando Belasteguín")).toBe(
        "Mirá las estadísticas de Fernando Belasteguín en Padel Red."
      );
    });

    it("returns region landmark labels for network, h2h, and history sections", () => {
      expect(getNetworkPositionRegionAriaLabel()).toBe("Estadísticas de red y posición");
      expect(getHeadToHeadRegionAriaLabel()).toBe("Estadísticas cara a cara");
      expect(getMatchHistoryRegionAriaLabel()).toBe("Historial reciente de partidos");
    });

    it("formats singular and plural network contact count text", () => {
      expect(formatNetworkContactsCountText(1)).toBe("1 jugador");
      expect(formatNetworkContactsCountText(12)).toBe("12 jugadores");
    });

    it("formats last match result text for H2H section", () => {
      expect(formatH2HLastMatchResultText(true, "6-4 6-2")).toBe("Victoria • 6-4 6-2");
      expect(formatH2HLastMatchResultText(false, "3-6 4-6")).toBe("Derrota • 3-6 4-6");
      expect(formatH2HLastMatchResultText(true, null)).toBe("Victoria");
    });

    it("returns public profile skeleton ARIA label", () => {
      expect(getPublicProfileSkeletonAriaLabel()).toBe("Cargando perfil público y estadísticas de jugador");
    });

    it("returns static titles, headings, and labels for public profile page", () => {
      expect(getPublicProfileHeaderTitle()).toBe("Perfil Público");
      expect(getPublicProfileHeaderSubtitle()).toBe("Estadísticas de jugador");
      expect(getPublicProfileWinRateLabel()).toBe("Efectividad");
      expect(getPublicProfileRecentFormLabel()).toBe("Forma");
      expect(getPublicProfileNetworkContactsLabel()).toBe("Contactos");
      expect(getPublicProfilePreferredSideHeadingText()).toBe("Lado preferido");
      expect(getPublicProfileSuccessfulPartnerLabel()).toBe("Pareja más exitosa");
      expect(getPublicProfileFrequentRivalLabel()).toBe("Rival más frecuente");
      expect(getPublicProfileHeadToHeadHeadingText()).toBe("Cara a Cara");
      expect(getPublicProfileAsPartnersLabel()).toBe("Como socios");
      expect(getPublicProfileAsRivalsLabel()).toBe("Como rivales");
      expect(getPublicProfileLastMatchLabel()).toBe("Último duelo");
      expect(getPublicProfileMatchHistoryHeadingText()).toBe("Historial Reciente");
      expect(getPublicProfileEmptyStateProps()).toEqual({
        title: "Sin resultados todavía",
        description: "Este jugador aún no tiene partidos confirmados.",
      });
    });

    it("composes mini court indicator and recent form dot classes correctly", () => {
      expect(getMiniCourtIndicatorClasses(true)).toContain("bg-primary");
      expect(getMiniCourtIndicatorClasses(false)).toContain("bg-muted");
      expect(getRecentFormDotClasses("W")).toContain("bg-emerald-500");
      expect(getRecentFormDotClasses("L")).toContain("bg-rose-500");
    });

    it("returns correct CSS class strings for public profile layout and card elements", () => {
      expect(getPublicProfileMainClasses()).toBe("mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-10 pb-20 min-h-screen");
      expect(getPublicProfileHeaderClasses()).toBe("flex items-center gap-4");
      expect(getPublicProfileBackButtonClasses()).toContain("bg-muted text-muted-foreground");
      expect(getPublicProfileHeaderSkeletonClasses()).toContain("bg-muted text-muted-foreground");
      expect(getPublicProfileAvatarBadgeClasses()).toContain("border-border bg-muted");
      expect(getPublicProfileStreakBadgeClasses()).toContain("bg-amber-100 text-amber-800");
      expect(getPublicProfileStatCardClasses()).toContain("rounded-xl border border-border bg-card");
      expect(getPublicProfileNetworkCardClasses()).toContain("rounded-xl border border-border bg-card");
      expect(getPublicProfileNetworkBadgeClasses()).toContain("bg-muted border border-border");
      expect(getPublicProfileH2HCardClasses()).toContain("rounded-xl border border-border bg-card");
      expect(getPublicProfileH2HResultClasses(true)).toContain("text-emerald-600");
      expect(getPublicProfileH2HResultClasses(false)).toContain("text-rose-600");
      expect(getPublicProfileMiniCourtContainerClasses()).toContain("shrink-0 w-10 h-7");
      expect(getPublicProfileMiniCourtGridClasses()).toContain("grid grid-cols-2");
      expect(getPublicProfileShareButtonClasses()).toContain("h-8 w-8 text-muted-foreground");
    });

    it("returns correct CSS class strings for public profile loading skeleton elements", () => {
      expect(getPublicProfileSkeletonContainerClasses()).toBe("space-y-6");
      expect(getPublicProfileSkeletonSummaryClasses()).toBe("flex flex-col items-center gap-4 text-center");
      expect(getPublicProfileSkeletonBannerClasses()).toBe("h-24 rounded-xl bg-card border border-border p-4 shadow-xs");
      expect(getPublicProfileSkeletonGridClasses()).toBe("grid grid-cols-2 gap-3");
      expect(getPublicProfileSkeletonHistoryClasses()).toBe("space-y-3");
    });
  });
});
