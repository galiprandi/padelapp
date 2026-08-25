import { describe, it, expect, vi } from "vitest";
import { getLevelBadgeLabel } from "@/lib/utils";

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

  it("constructs proper aria-labels for player preview management actions", () => {
    const formatManageAriaLabel = (name: string, isConfirmed?: boolean, customLabel?: string) => {
      if (customLabel) return customLabel;
      return isConfirmed ? `Gestionar jugador ${name}` : `Invitar jugador ${name}`;
    };

    expect(formatManageAriaLabel("Fernando Belasteguín", true)).toBe("Gestionar jugador Fernando Belasteguín");
    expect(formatManageAriaLabel("Agustín Tapia", false)).toBe("Invitar jugador Agustín Tapia");
    expect(formatManageAriaLabel("Juan Lebrón", false, "Custom label")).toBe("Custom label");
  });

  it("triggers interactive handler on Enter or Space keyboard press", () => {
    const mockAction = vi.fn();

    const handleKeyDown = (key: string, isInteractive: boolean) => {
      if (isInteractive && (key === "Enter" || key === " ")) {
        mockAction();
      }
    };

    handleKeyDown("Enter", true);
    expect(mockAction).toHaveBeenCalledTimes(1);

    handleKeyDown(" ", true);
    expect(mockAction).toHaveBeenCalledTimes(2);

    handleKeyDown("Tab", true);
    expect(mockAction).toHaveBeenCalledTimes(2);

    handleKeyDown("Enter", false);
    expect(mockAction).toHaveBeenCalledTimes(2);
  });
});
