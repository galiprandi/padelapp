import { describe, it, expect, vi } from "vitest";
import React from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
}));

vi.mock("@/components/toast/use-toast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("@/app/(app)/turnos/actions", () => ({
  joinTurnAction: vi.fn(),
  joinSubstituteAction: vi.fn(),
}));

vi.mock("@/lib/magic-link", () => ({
  createMagicLink: vi.fn().mockReturnValue({ url: "https://padelred.app/t/turn-101" }),
}));

import { TurnCard } from "../turn-card";

describe("TurnCard Component", () => {
  const sampleTurn = {
    id: "turn-101",
    club: "Central Padel Club",
    date: new Date("2026-09-25T19:00:00Z"),
    maxPlayers: 4,
    status: "OPEN",
    players: [
      { userId: "u1", user: { id: "u1", displayName: "Facundo", alias: "Facu", image: null } },
      { userId: "u2", user: { id: "u2", displayName: "Gonzalo", alias: "Gonza", image: null } },
      { userId: "u3", user: { id: "u3", displayName: "Mateo", alias: "Teo", image: null } },
    ],
    substitutes: [],
  };

  it("exports TurnCard as a valid React component function", () => {
    expect(typeof TurnCard).toBe("function");
  });

  it("constructs a React element with expected props", () => {
    const element = React.createElement(TurnCard, {
      turn: sampleTurn,
      isJoined: false,
      isCreator: false,
    });

    expect(element).toBeDefined();
    expect(element.props.turn.club).toBe("Central Padel Club");
    expect(element.props.turn.maxPlayers).toBe(4);
    expect(element.props.turn.players).toHaveLength(3);
  });
});
