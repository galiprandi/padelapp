import { describe, it, expect, vi } from "vitest";
import { getLevelBadgeLabel } from "@/lib/utils";
import {
  getPlayerCardAriaLabel,
  formatPlayerSubtitle,
  handlePlayerCardKeyDown,
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
});
