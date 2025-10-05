import type { TeamState } from "@/lib/match-types";

type TeamKey = "A" | "B";

export function positionFromTeam(team: TeamKey, index: 0 | 1): number {
  return team === "A" ? index : index + 2;
}

export function avatarFallback(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

export function createPlaceholderSlot(name: string) {
  return {
    kind: "placeholder" as const,
    displayName: name,
  };
}

export const PLACEHOLDER_SLOTS = [
  { team: "A" as const, index: 1 as const, name: "Jugador 2" },
  { team: "B" as const, index: 0 as const, name: "Jugador 3" },
  { team: "B" as const, index: 1 as const, name: "Jugador 4" },
];

export function buildInitialState(): TeamState {
  const state: TeamState = {
    A: [null, null],
    B: [null, null],
  };

  PLACEHOLDER_SLOTS.forEach(({ team, index, name }) => {
    state[team][index] = createPlaceholderSlot(name);
  });

  return state;
}

export type { TeamKey };
