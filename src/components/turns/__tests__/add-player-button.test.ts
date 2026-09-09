import { describe, it, expect, vi } from "vitest";
import React from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/components/toast/use-toast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("@/app/(app)/turnos/actions", () => ({
  addPlayerAction: vi.fn(),
}));

import { AddPlayerButton } from "../add-player-button";
import {
  filterAndSortPlayerOptions,
  getAddPlayerSuccessToast,
  getAddPlayerAriaLabel,
} from "../turn-utils";

describe("AddPlayerButton & Manual Add Helpers", () => {
  it("creates React element for AddPlayerButton with correct props contract", () => {
    const element = React.createElement(AddPlayerButton, {
      turnId: "turn-123",
      existingPlayerIds: ["user-1", "user-2"],
    });

    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.turnId).toBe("turn-123");
    expect(element.props.existingPlayerIds).toEqual(["user-1", "user-2"]);
  });

  it("filters existing player IDs out of search options", () => {
    const mockPlayers = [
      { id: "p1", displayName: "Franco", isContact: false },
      { id: "p2", displayName: "Martín", isContact: true },
      { id: "p3", displayName: "Nicolás", isContact: false },
    ];

    const result = filterAndSortPlayerOptions(mockPlayers, ["p1"]);
    expect(result.map((p) => p.id)).toEqual(["p2", "p3"]);
  });

  it("sorts contacts to top of search results", () => {
    const mockPlayers = [
      { id: "p1", displayName: "Franco", isContact: false },
      { id: "p2", displayName: "Martín", isContact: true },
      { id: "p3", displayName: "Nicolás", isContact: true },
      { id: "p4", displayName: "Gonzalo", isContact: false },
    ];

    const result = filterAndSortPlayerOptions(mockPlayers, []);
    expect(result[0].isContact).toBe(true);
    expect(result[1].isContact).toBe(true);
    expect(result[2].isContact).toBe(false);
    expect(result[3].isContact).toBe(false);
  });

  it("formats success toast message for manually adding player in Argentine Spanish voseo", () => {
    const toast = getAddPlayerSuccessToast("Facundo");
    expect(toast).toBe("Agregaste a Facundo al turno.");
    expect(toast).not.toContain("!");
    expect(toast).not.toContain("¡");
  });

  it("formats ARIA label for player addition action trigger", () => {
    const label = getAddPlayerAriaLabel("Facundo");
    expect(label).toBe("Agregar a Facundo al turno");
  });
});
