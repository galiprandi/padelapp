import { describe, it, expect, vi } from "vitest";
import { getLevelBadgeLabel } from "@/lib/utils";
import {
  getPlayerCardAriaLabel,
  formatPlayerSubtitle,
  handlePlayerCardKeyDown,
  isSafeAvatarImage,
  getPlayerAvatarAriaLabel,
  getPlayerAvatarClasses,
  getPlayerAvatarDimensionStyle,
  getPlayerCardContainerClasses,
  getPairRegionAriaLabel,
  getRankingBadgeAriaLabel,
  getPlayerRankingBadgeClasses,
  getPlayerCompactRankingBadgeClasses,
  getPlayerPreviewManageIconContainerClasses,
  getPairPreviewContainerClasses,
  getPairBadgeClasses,
  getPairPreviewBodyClasses,
  getPairPreviewLineClasses,
  getPairPreviewConnectorClasses,
  getPairInlineContainerClasses,
  getPairInlineContentClasses,
  getPairInlinePlayerItemClasses,
  getPairInlineDividerClasses,
  getPairInlineAvatarClasses,
} from "../player-card-utils";

describe("Player Cards Category & Accessibility Utilities", () => {
  it("formats player category level integer to Argentine Padel category label", () => {
    expect(getLevelBadgeLabel(1)).toBe("1ª Cat.");
    expect(getLevelBadgeLabel(2)).toBe("2ª Cat.");
    expect(getLevelBadgeLabel(6)).toBe("6ª Cat.");
    expect(getLevelBadgeLabel(8)).toBe("8ª Cat.");
  });

  it("handles null, undefined or out-of-bound category levels with standard 6ª Cat. fallback", () => {
    expect(getLevelBadgeLabel(null)).toBe("6ª Cat.");
    expect(getLevelBadgeLabel(undefined)).toBe("6ª Cat.");
    expect(getLevelBadgeLabel(0)).toBe("6ª Cat.");
    expect(getLevelBadgeLabel(9)).toBe("6ª Cat.");
  });

  it("constructs proper aria-labels for player preview management and profile actions", () => {
    expect(
      getPlayerCardAriaLabel({
        name: "Fernando Belasteguín",
        isInteractive: true,
        onManageClick: () => {},
        isConfirmed: true,
      })
    ).toBe("Gestionar jugador Fernando Belasteguín");

    expect(
      getPlayerCardAriaLabel({
        name: "Agustín Tapia",
        isInteractive: true,
        onManageClick: () => {},
        isConfirmed: false,
      })
    ).toBe("Invitar jugador Agustín Tapia");

    expect(
      getPlayerCardAriaLabel({
        name: "Juan Lebrón",
        isInteractive: true,
        customLabel: "Custom label",
      })
    ).toBe("Custom label");

    expect(
      getPlayerCardAriaLabel({
        name: "Martin Di Nenno",
        isInteractive: true,
      })
    ).toBe("Ver perfil de Martin Di Nenno");

    expect(
      getPlayerCardAriaLabel({
        name: "Franco Stupaczuk",
        isInteractive: false,
      })
    ).toBeUndefined();
  });

  it("formats player subtitle combining role and category label", () => {
    expect(formatPlayerSubtitle("Pareja A", 3)).toBe("Pareja A · 3ª Cat.");
    expect(formatPlayerSubtitle("Organizador")).toBe("Organizador");
    expect(formatPlayerSubtitle(undefined, 6)).toBe("6ª Cat.");
    expect(formatPlayerSubtitle()).toBeNull();
  });

  it("triggers interactive handler on Enter or Space keyboard press", () => {
    const mockAction = vi.fn();

    const createSyntheticEvent = (key: string) =>
      ({
        key,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);

    const enterEvent = createSyntheticEvent("Enter");
    handlePlayerCardKeyDown(enterEvent, true, mockAction);
    expect(enterEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(mockAction).toHaveBeenCalledTimes(1);

    const spaceEvent = createSyntheticEvent(" ");
    handlePlayerCardKeyDown(spaceEvent, true, mockAction);
    expect(spaceEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(mockAction).toHaveBeenCalledTimes(2);

    const tabEvent = createSyntheticEvent("Tab");
    handlePlayerCardKeyDown(tabEvent, true, mockAction);
    expect(tabEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockAction).toHaveBeenCalledTimes(2);

    const nonInteractiveEnter = createSyntheticEvent("Enter");
    handlePlayerCardKeyDown(nonInteractiveEnter, false, mockAction);
    expect(nonInteractiveEnter.preventDefault).not.toHaveBeenCalled();
    expect(mockAction).toHaveBeenCalledTimes(2);
  });

  describe("isSafeAvatarImage", () => {
    it("returns true for allowed Google image URLs", () => {
      expect(
        isSafeAvatarImage("https://lh3.googleusercontent.com/a/default-user-photo")
      ).toBe(true);
    });

    it("returns false for non-allowed hosts or empty/null inputs", () => {
      expect(isSafeAvatarImage("https://malicious.example.com/photo.png")).toBe(false);
      expect(isSafeAvatarImage("")).toBe(false);
      expect(isSafeAvatarImage(null)).toBe(false);
      expect(isSafeAvatarImage(undefined)).toBe(false);
    });
  });

  describe("getPlayerAvatarAriaLabel", () => {
    it("generates correct Argentine Spanish ARIA labels for safe images vs initials fallback", () => {
      expect(getPlayerAvatarAriaLabel("Agustín Tapia", true)).toBe(
        "Foto de perfil de Agustín Tapia"
      );
      expect(getPlayerAvatarAriaLabel("Agustín Tapia", false)).toBe(
        "Iniciales de Agustín Tapia"
      );
    });

    it("provides fallback for whitespace-only name input", () => {
      expect(getPlayerAvatarAriaLabel("   ", false)).toBe("Iniciales de Jugador");
    });
  });

  describe("getPlayerAvatarClasses", () => {
    it("returns base container classes and merges optional custom className", () => {
      const classes = getPlayerAvatarClasses("rounded-full border-primary");
      expect(classes).toContain("flex shrink-0 items-center justify-center");
      expect(classes).toContain("bg-muted");
      expect(classes).toContain("rounded-full");
      expect(classes).toContain("border-primary");
    });
  });

  describe("getPlayerAvatarDimensionStyle", () => {
    it("generates width and height style properties based on size", () => {
      expect(getPlayerAvatarDimensionStyle(40)).toEqual({
        width: "40px",
        height: "40px",
      });
      expect(getPlayerAvatarDimensionStyle(32)).toEqual({
        width: "32px",
        height: "32px",
      });
      expect(getPlayerAvatarDimensionStyle()).toEqual({
        width: "40px",
        height: "40px",
      });
    });
  });

  describe("getPlayerCardContainerClasses", () => {
    it("includes base layout and interactive classes when interactive", () => {
      const classes = getPlayerCardContainerClasses(true, "custom-class");
      expect(classes).toContain("flex items-center gap-3");
      expect(classes).toContain("hover:bg-muted");
      expect(classes).toContain("active:scale-[0.98]");
      expect(classes).toContain("custom-class");
    });

    it("omits interactive hover/active classes when not interactive", () => {
      const classes = getPlayerCardContainerClasses(false);
      expect(classes).toContain("flex items-center gap-3");
      expect(classes).not.toContain("hover:bg-muted");
      expect(classes).not.toContain("active:scale-[0.98]");
    });
  });

  describe("getPairRegionAriaLabel", () => {
    it("returns formatted ARIA landmark label for pair groupings", () => {
      expect(getPairRegionAriaLabel("Pareja A")).toBe("Grupo de pareja: Pareja A");
      expect(getPairRegionAriaLabel("   ")).toBe("Grupo de pareja: Pareja");
    });
  });

  describe("getRankingBadgeAriaLabel", () => {
    it("returns formatted ARIA label for ranking position badges", () => {
      expect(getRankingBadgeAriaLabel(1)).toBe("Puesto número 1 en el ranking");
      expect(getRankingBadgeAriaLabel(12)).toBe("Puesto número 12 en el ranking");
    });
  });

  describe("Player & Pair UI Styling Helper Functions", () => {
    it("returns correct ranking badge classes", () => {
      const normalBadge = getPlayerRankingBadgeClasses();
      expect(normalBadge).toContain("flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-muted px-2");
      expect(normalBadge).toContain("border border-border shadow-xs");

      const compactBadge = getPlayerCompactRankingBadgeClasses();
      expect(compactBadge).toContain("flex h-7 min-w-[28px] items-center justify-center rounded-md bg-muted px-1.5");
      expect(compactBadge).toContain("border border-border shadow-xs");
    });

    it("returns manage icon container classes", () => {
      const manageClasses = getPlayerPreviewManageIconContainerClasses();
      expect(manageClasses).toBe("flex h-8 w-8 items-center justify-center text-muted-foreground");
    });

    it("returns pair preview layout classes", () => {
      expect(getPairPreviewContainerClasses()).toContain("relative rounded-xl border border-border bg-card mt-8 shadow-xs");
      expect(getPairBadgeClasses()).toContain("absolute left-6 top-0 -translate-y-1/2 rounded-full bg-background");
      expect(getPairPreviewBodyClasses()).toContain("relative space-y-3 p-5 pt-6");
      expect(getPairPreviewLineClasses()).toContain("pointer-events-none absolute left-2 top-8 bottom-8 w-px bg-border");
      expect(getPairPreviewConnectorClasses()).toContain("pointer-events-none absolute left-[-20px] top-1/2 h-px w-5 -translate-y-1/2 bg-border");
    });

    it("returns pair inline layout classes", () => {
      expect(getPairInlineContainerClasses()).toContain("relative rounded-xl border border-border bg-card shadow-xs");
      expect(getPairInlineContentClasses()).toContain("flex items-center gap-4 px-6 py-6 pt-7");
      expect(getPairInlinePlayerItemClasses()).toContain("flex min-w-0 flex-1 items-center gap-3 group transition-colors");
      expect(getPairInlineDividerClasses()).toBe("h-8 w-px bg-border");
      expect(getPairInlineAvatarClasses()).toBe("rounded-lg border border-border shadow-xs");
    });
  });
});
