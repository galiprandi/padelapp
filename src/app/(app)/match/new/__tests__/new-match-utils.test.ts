import { describe, it, expect } from "vitest";
import {
  extractUniqueUserIds,
  canSuggestPairings,
  buildUserOptionsMap,
  buildSuggestedTeamState,
  shouldSwapUserPosition,
  getStepRegionAriaLabel,
} from "../new-match-utils";
import type { TeamState, PlayerOption } from "@/lib/match-types";

const mockPlayer1: PlayerOption = { id: "p1", displayName: "Agustín Tapia", email: "tapia@padel.com", image: null };
const mockPlayer2: PlayerOption = { id: "p2", displayName: "Arturo Coello", email: "coello@padel.com", image: null };
const mockPlayer3: PlayerOption = { id: "p3", displayName: "Ale Galán", email: "galan@padel.com", image: null };
const mockPlayer4: PlayerOption = { id: "p4", displayName: "Fede Chingotto", email: "chingotto@padel.com", image: null };

describe("new-match-utils", () => {
  describe("extractUniqueUserIds & canSuggestPairings", () => {
    it("returns empty array and false when team state has only placeholders", () => {
      const teamState: TeamState = {
        A: [{ kind: "placeholder", displayName: "J1" }, null],
        B: [null, null],
      };
      expect(extractUniqueUserIds(teamState)).toEqual([]);
      expect(canSuggestPairings(teamState)).toBe(false);
    });

    it("returns unique user IDs and identifies when exactly 4 users are present", () => {
      const teamState: TeamState = {
        A: [
          { kind: "user", player: mockPlayer1 },
          { kind: "user", player: mockPlayer2 },
        ],
        B: [
          { kind: "user", player: mockPlayer3 },
          { kind: "user", player: mockPlayer4 },
        ],
      };
      expect(extractUniqueUserIds(teamState)).toEqual(["p1", "p2", "p3", "p4"]);
      expect(canSuggestPairings(teamState)).toBe(true);
    });

    it("handles duplicates correctly when calculating unique users", () => {
      const teamState: TeamState = {
        A: [
          { kind: "user", player: mockPlayer1 },
          { kind: "user", player: mockPlayer1 },
        ],
        B: [
          { kind: "user", player: mockPlayer2 },
          { kind: "user", player: mockPlayer3 },
        ],
      };
      expect(extractUniqueUserIds(teamState)).toEqual(["p1", "p2", "p3"]);
      expect(canSuggestPairings(teamState)).toBe(false);
    });
  });

  describe("buildUserOptionsMap & buildSuggestedTeamState", () => {
    it("builds map of user options and constructs suggested team state", () => {
      const teamState: TeamState = {
        A: [
          { kind: "user", player: mockPlayer1 },
          { kind: "user", player: mockPlayer2 },
        ],
        B: [
          { kind: "user", player: mockPlayer3 },
          { kind: "user", player: mockPlayer4 },
        ],
      };

      const map = buildUserOptionsMap(teamState);
      expect(map.size).toBe(4);
      expect(map.get("p1")).toEqual(mockPlayer1);

      const suggestedPairings = {
        teamA: { derecha: "p2", reves: "p1" },
        teamB: { derecha: "p4", reves: "p3" },
      };

      const result = buildSuggestedTeamState(suggestedPairings, map);
      expect(result).not.toBeNull();
      expect(result?.A[0]).toEqual({ kind: "user", player: mockPlayer2 });
      expect(result?.A[1]).toEqual({ kind: "user", player: mockPlayer1 });
      expect(result?.B[0]).toEqual({ kind: "user", player: mockPlayer4 });
      expect(result?.B[1]).toEqual({ kind: "user", player: mockPlayer3 });
    });

    it("returns null if suggested player ID is missing from map", () => {
      const map = new Map<string, PlayerOption>([
        ["p1", mockPlayer1],
        ["p2", mockPlayer2],
      ]);
      const suggestedPairings = {
        teamA: { derecha: "p1", reves: "p2" },
        teamB: { derecha: "p3", reves: "p4" },
      };
      expect(buildSuggestedTeamState(suggestedPairings, map)).toBeNull();
    });
  });

  describe("shouldSwapUserPosition", () => {
    it("returns false if currentUser is not in Team A", () => {
      const teamState: TeamState = {
        A: [{ kind: "user", player: mockPlayer1 }, null],
        B: [{ kind: "user", player: mockPlayer2 }, null],
      };
      expect(
        shouldSwapUserPosition({
          currentUser: { id: "p2" },
          teamState,
          desiredPosition: "reves",
        })
      ).toBe(false);
    });

    it("returns true if currentUser is at derecha (0) but desires reves", () => {
      const teamState: TeamState = {
        A: [{ kind: "user", player: mockPlayer1 }, { kind: "user", player: mockPlayer2 }],
        B: [null, null],
      };
      expect(
        shouldSwapUserPosition({
          currentUser: { id: "p1" },
          teamState,
          desiredPosition: "reves",
        })
      ).toBe(true);
    });

    it("returns true if currentUser is at reves (1) but desires derecha", () => {
      const teamState: TeamState = {
        A: [{ kind: "user", player: mockPlayer2 }, { kind: "user", player: mockPlayer1 }],
        B: [null, null],
      };
      expect(
        shouldSwapUserPosition({
          currentUser: { id: "p1" },
          teamState,
          desiredPosition: "derecha",
        })
      ).toBe(true);
    });

    it("returns false if user is already at their desired position", () => {
      const teamState: TeamState = {
        A: [{ kind: "user", player: mockPlayer1 }, { kind: "user", player: mockPlayer2 }],
        B: [null, null],
      };
      expect(
        shouldSwapUserPosition({
          currentUser: { id: "p1" },
          teamState,
          desiredPosition: "derecha",
        })
      ).toBe(false);
    });
  });

  describe("getStepRegionAriaLabel", () => {
    it("returns localized Argentine Spanish ARIA labels for steps 0 to 3", () => {
      expect(getStepRegionAriaLabel(0)).toContain("Paso 1: Armado de parejas");
      expect(getStepRegionAriaLabel(1)).toContain("Paso 2: Selección de formato");
      expect(getStepRegionAriaLabel(2)).toContain("Paso 3: Sede, club");
      expect(getStepRegionAriaLabel(3)).toContain("Paso 4: Carga e ingreso de marcador");
    });
  });
});
