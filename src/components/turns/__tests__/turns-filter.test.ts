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

import { TurnsFilter } from "../turns-filter";
import { getTurnFilterHeadingTitle, getTurnFilterEmptyStateProps } from "../turn-utils";

describe("TurnsFilter Component", () => {
  const sampleTurns = [
    {
      id: "turn-101",
      club: "Central Padel Club",
      date: new Date("2026-09-25T19:00:00Z"),
      creatorId: "u1",
      maxPlayers: 4,
      status: "OPEN",
      players: [
        { userId: "u1", user: { id: "u1", displayName: "Facundo", alias: "Facu", image: null } },
        { userId: "u2", user: { id: "u2", displayName: "Gonzalo", alias: "Gonza", image: null } },
      ],
      substitutes: [],
    },
    {
      id: "turn-102",
      club: "Padel Park",
      date: new Date("2026-09-26T20:00:00Z"),
      creatorId: "u3",
      maxPlayers: 4,
      status: "OPEN",
      players: [
        { userId: "u3", user: { id: "u3", displayName: "Mateo", alias: "Teo", image: null } },
      ],
      substitutes: [],
    },
  ];

  it("exports TurnsFilter as a valid React component function", () => {
    expect(typeof TurnsFilter).toBe("function");
  });

  it("constructs a React element for TurnsFilter with turns list and userId", () => {
    const element = React.createElement(TurnsFilter, {
      turns: sampleTurns,
      userId: "u1",
    });

    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.turns).toHaveLength(2);
    expect(element.props.userId).toBe("u1");
  });

  it("constructs a React element for logged-out state with null userId", () => {
    const element = React.createElement(TurnsFilter, {
      turns: sampleTurns,
      userId: null,
    });

    expect(React.isValidElement(element)).toBe(true);
    expect(element.props.userId).toBeNull();
  });

  it("returns correct section heading titles and empty state props via pure helpers", () => {
    expect(getTurnFilterHeadingTitle("todos")).toBe("Próximos turnos");
    expect(getTurnFilterHeadingTitle("mis-turnos")).toBe("Mis partidos programados");

    const emptyTodos = getTurnFilterEmptyStateProps("todos");
    expect(emptyTodos.title).toBe("Sin turnos abiertos");
    expect(emptyTodos.createButtonLabel).toBe("Crear turno");

    const emptyMyTurns = getTurnFilterEmptyStateProps("mis-turnos");
    expect(emptyMyTurns.title).toBe("No estás anotado en ningún turno");
    expect(emptyMyTurns.exploreButtonLabel).toBe("Explorar turnos abiertos");
  });
});
