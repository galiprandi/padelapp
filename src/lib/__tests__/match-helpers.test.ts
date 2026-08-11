import { describe, it, expect } from "vitest";
import {
  isValidMatchType,
  defaultTeamLabel,
  sanitizeTeamLabel,
  teamForPosition,
} from "@/lib/match-helpers";
import { getMatchWinner } from "@/lib/utils";

describe("isValidMatchType", () => {
  it("accepts FRIENDLY", () => {
    expect(isValidMatchType("FRIENDLY")).toBe(true);
  });

  it("accepts LOCAL_TOURNAMENT", () => {
    expect(isValidMatchType("LOCAL_TOURNAMENT")).toBe(true);
  });

  it("rejects unknown type", () => {
    expect(isValidMatchType("UNKNOWN")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidMatchType("")).toBe(false);
  });

  it("rejects lowercase", () => {
    expect(isValidMatchType("friendly")).toBe(false);
  });
});

describe("defaultTeamLabel", () => {
  it("returns 'Pareja A' for team A in doubles", () => {
    expect(defaultTeamLabel("A", "DOUBLES")).toBe("Pareja A");
  });

  it("returns 'Pareja B' for team B in doubles", () => {
    expect(defaultTeamLabel("B", "DOUBLES")).toBe("Pareja B");
  });

  it("returns 'Jugador A' for team A in singles", () => {
    expect(defaultTeamLabel("A", "SINGLES")).toBe("Jugador A");
  });

  it("returns 'Jugador B' for team B in singles", () => {
    expect(defaultTeamLabel("B", "SINGLES")).toBe("Jugador B");
  });
});

describe("sanitizeTeamLabel", () => {
  it("returns default when value is undefined", () => {
    expect(sanitizeTeamLabel(undefined, "A", "DOUBLES")).toBe("Pareja A");
  });

  it("returns default when value is empty string", () => {
    expect(sanitizeTeamLabel("", "B", "DOUBLES")).toBe("Pareja B");
  });

  it("returns default when value is only whitespace", () => {
    expect(sanitizeTeamLabel("   ", "A", "SINGLES")).toBe("Jugador A");
  });

  it("returns trimmed value when valid", () => {
    expect(sanitizeTeamLabel("Los cracks", "A", "DOUBLES")).toBe("Los cracks");
  });

  it("trims surrounding whitespace from valid value", () => {
    expect(sanitizeTeamLabel("  Los cracks  ", "A", "DOUBLES")).toBe("Los cracks");
  });
});

describe("teamForPosition", () => {
  it("returns A for position 0 in singles (2 players)", () => {
    expect(teamForPosition(0, 2)).toBe("A");
  });

  it("returns B for position 1 in singles (2 players)", () => {
    expect(teamForPosition(1, 2)).toBe("B");
  });

  it("returns A for position 0 in doubles (4 players)", () => {
    expect(teamForPosition(0, 4)).toBe("A");
  });

  it("returns A for position 1 in doubles (4 players)", () => {
    expect(teamForPosition(1, 4)).toBe("A");
  });

  it("returns B for position 2 in doubles (4 players)", () => {
    expect(teamForPosition(2, 4)).toBe("B");
  });

  it("returns B for position 3 in doubles (4 players)", () => {
    expect(teamForPosition(3, 4)).toBe("B");
  });

  it("handles 3 players (casual mode) like doubles", () => {
    expect(teamForPosition(0, 3)).toBe("A");
    expect(teamForPosition(1, 3)).toBe("A");
    expect(teamForPosition(2, 3)).toBe("B");
  });
});

describe("computeBestPartnerAndNemesis", () => {
  it("calculates best partner and nemesis correctly from confirmed matches", () => {
    const viewerId = "p-01";
    const confirmedMatches = [
      {
        id: "m-01",
        score: "6-4, 6-3", // Team A wins
        players: [
          { position: 0, user: { id: "p-01", displayName: "Agustín" } },
          { position: 1, user: { id: "p-02", displayName: "Fernando" } },
          { position: 2, user: { id: "p-03", displayName: "Ramiro" } },
          { position: 3, user: { id: "p-04", displayName: "Gero" } },
        ],
      },
      {
        id: "m-02",
        score: "4-6, 5-7", // Team B wins
        players: [
          { position: 0, user: { id: "p-01", displayName: "Agustín" } },
          { position: 1, user: { id: "p-03", displayName: "Ramiro" } },
          { position: 2, user: { id: "p-02", displayName: "Fernando" } },
          { position: 3, user: { id: "p-04", displayName: "Gero" } },
        ],
      },
    ];

    const matchResults = confirmedMatches.map((match) => {
      const winner = getMatchWinner(match.score);
      if (!winner) return "L";
      const player = match.players.find((p) => p.user?.id === viewerId);
      const playerTeam = (player?.position ?? 0) < 2 ? "A" : "B";
      return winner === playerTeam ? "W" : "L";
    });

    const partnersWins: Record<string, { name: string; wins: number }> = {};
    const rivalsLosses: Record<string, { name: string; losses: number }> = {};

    confirmedMatches.forEach((match, idx) => {
      const viewer = match.players.find((p) => p.user?.id === viewerId);
      if (!viewer) return;
      const viewerTeamIdx = viewer.position < 2 ? 0 : 1;

      if (matchResults[idx] === "W") {
        const partner = match.players.find(
          (p) =>
            p.user?.id !== viewerId &&
            (viewerTeamIdx === 0 ? p.position < 2 : p.position >= 2),
        );
        if (partner && partner.user) {
          const pId = partner.user.id;
          const pName = partner.user.displayName || "Compañero";
          if (!partnersWins[pId]) partnersWins[pId] = { name: pName, wins: 0 };
          partnersWins[pId].wins += 1;
        }
      } else if (matchResults[idx] === "L") {
        const rivals = match.players.filter(
          (p) =>
            p.user?.id !== viewerId &&
            (viewerTeamIdx === 0 ? p.position >= 2 : p.position < 2),
        );
        rivals.forEach((rival) => {
          if (rival.user) {
            const rId = rival.user.id;
            const rName = rival.user.displayName || "Rival";
            if (!rivalsLosses[rId]) rivalsLosses[rId] = { name: rName, losses: 0 };
            rivalsLosses[rId].losses += 1;
          }
        });
      }
    });

    const bestPartner = Object.values(partnersWins).sort(
      (a, b) => b.wins - a.wins,
    )[0];

    const nemesis = Object.values(rivalsLosses).sort(
      (a, b) => b.losses - a.losses,
    )[0];

    expect(bestPartner).toBeDefined();
    expect(bestPartner.name).toBe("Fernando");
    expect(bestPartner.wins).toBe(1);

    expect(nemesis).toBeDefined();
    expect(["Fernando", "Gero"]).toContain(nemesis.name);
    expect(nemesis.losses).toBe(1);
  });
});
