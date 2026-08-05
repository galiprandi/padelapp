import { describe, it, expect } from "vitest";
import {
  computeScore,
  computeAttendanceScore,
  computeStatsForUsers,
  type UserStats,
} from "@/lib/ranking-engine";

function makeBaseStats(overrides: Partial<UserStats> = {}): UserStats {
  return {
    wins: 0,
    losses: 0,
    streak: 0,
    matchesPlayed: 0,
    lastMatchAt: null,
    setsWonBonus: 0,
    confirmedMatchesCount: 0,
    totalMatchesCount: 0,
    noShowPenalty: 0,
    latePenalty: 0,
    attendedCount: 0,
    noShowCount: 0,
    lateCount: 0,
    ...overrides,
  };
}

describe("computeScore", () => {
  it("returns base 1000 for a new player with no matches", () => {
    expect(computeScore(makeBaseStats())).toBe(1000);
  });

  it("adds 15 points per win", () => {
    expect(computeScore(makeBaseStats({ wins: 10 }))).toBe(1150);
  });

  it("adds 5 points per streak win", () => {
    expect(computeScore(makeBaseStats({ streak: 3 }))).toBe(1015);
  });

  it("adds setsWonBonus", () => {
    expect(computeScore(makeBaseStats({ setsWonBonus: 12 }))).toBe(1012);
  });

  it("subtracts noShowPenalty", () => {
    expect(computeScore(makeBaseStats({ noShowPenalty: 50 }))).toBe(950);
  });

  it("subtracts latePenalty", () => {
    expect(computeScore(makeBaseStats({ latePenalty: 20 }))).toBe(980);
  });

  it("combines all factors", () => {
    const stats = makeBaseStats({
      wins: 10,
      streak: 3,
      setsWonBonus: 12,
      noShowPenalty: 25,
      latePenalty: 10,
    });
    // 1000 + 150 + 15 + 12 - 25 - 10 = 1142
    expect(computeScore(stats)).toBe(1142);
  });

  it("applies 0.5 decay after 60 days inactive", () => {
    const date = new Date(Date.now() - 70 * 24 * 60 * 60 * 1000); // 70 days ago
    const stats = makeBaseStats({ wins: 10, lastMatchAt: date });
    // (1000 + 150) * 0.5 = 575
    expect(computeScore(stats)).toBe(575);
  });

  it("applies 0.25 decay after 120 days inactive", () => {
    const date = new Date(Date.now() - 150 * 24 * 60 * 60 * 1000); // 150 days ago
    const stats = makeBaseStats({ wins: 10, lastMatchAt: date });
    // (1000 + 150) * 0.25 = 287.5
    expect(computeScore(stats)).toBe(287.5);
  });

  it("does not decay for recent matches", () => {
    const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    const stats = makeBaseStats({ wins: 10, lastMatchAt: date });
    expect(computeScore(stats)).toBe(1150);
  });

  it("does not decay when lastMatchAt is null", () => {
    const stats = makeBaseStats({ wins: 10, lastMatchAt: null });
    expect(computeScore(stats)).toBe(1150);
  });
});

describe("computeAttendanceScore", () => {
  it("returns 1.0 for a new player with no matches", () => {
    expect(computeAttendanceScore(makeBaseStats())).toBe(1.0);
  });

  it("returns 1.0 when all attended", () => {
    const stats = makeBaseStats({ attendedCount: 10, lateCount: 0, noShowCount: 0 });
    expect(computeAttendanceScore(stats)).toBe(1.0);
  });

  it("counts late as attended", () => {
    const stats = makeBaseStats({ attendedCount: 8, lateCount: 2, noShowCount: 0 });
    expect(computeAttendanceScore(stats)).toBe(1.0);
  });

  it("penalizes no-shows", () => {
    const stats = makeBaseStats({ attendedCount: 7, lateCount: 1, noShowCount: 2 });
    // (7 + 1) / (7 + 1 + 2) = 8/10 = 0.8
    expect(computeAttendanceScore(stats)).toBe(0.8);
  });

  it("returns 0 when all no-shows", () => {
    const stats = makeBaseStats({ attendedCount: 0, lateCount: 0, noShowCount: 5 });
    expect(computeAttendanceScore(stats)).toBe(0);
  });

  it("falls back to confirmed/total ratio when no attendance tracked", () => {
    const stats = makeBaseStats({
      attendedCount: 0,
      lateCount: 0,
      noShowCount: 0,
      confirmedMatchesCount: 8,
      totalMatchesCount: 10,
    });
    expect(computeAttendanceScore(stats)).toBe(0.8);
  });

  it("returns 1.0 when no attendance and no matches", () => {
    const stats = makeBaseStats({
      attendedCount: 0,
      lateCount: 0,
      noShowCount: 0,
      confirmedMatchesCount: 0,
      totalMatchesCount: 0,
    });
    expect(computeAttendanceScore(stats)).toBe(1.0);
  });
});

describe("computeStatsForUsers", () => {
  it("returns empty map for empty input", () => {
    const result = computeStatsForUsers([]);
    expect(result.size).toBe(0);
  });

  it("skips entries with null userId", () => {
    const result = computeStatsForUsers([
      {
        userId: null,
        position: 0,
        resultConfirmed: true,
        attendance: null,
        match: { status: "CONFIRMED", score: "6-4", date: new Date() },
      },
    ]);
    expect(result.size).toBe(0);
  });

  it("counts a win for team A player when team A wins", () => {
    const date = new Date();
    const result = computeStatsForUsers([
      {
        userId: "player-a",
        position: 0, // team A
        resultConfirmed: true,
        attendance: "ATTENDED",
        match: { status: "CONFIRMED", score: "6-4", date },
      },
    ]);
    const stats = result.get("player-a")!;
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(0);
    expect(stats.matchesPlayed).toBe(1);
    expect(stats.streak).toBe(1);
  });

  it("counts a loss for team A player when team B wins", () => {
    const date = new Date();
    const result = computeStatsForUsers([
      {
        userId: "player-a",
        position: 0, // team A
        resultConfirmed: true,
        attendance: "ATTENDED",
        match: { status: "CONFIRMED", score: "4-6", date },
      },
    ]);
    const stats = result.get("player-a")!;
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(1);
    expect(stats.streak).toBe(-1);
  });

  it("counts a win for team B player when team B wins", () => {
    const date = new Date();
    const result = computeStatsForUsers([
      {
        userId: "player-b",
        position: 2, // team B
        resultConfirmed: true,
        attendance: "ATTENDED",
        match: { status: "CONFIRMED", score: "4-6, 3-6", date },
      },
    ]);
    const stats = result.get("player-b")!;
    expect(stats.wins).toBe(1);
    expect(stats.streak).toBe(1);
  });

  it("accumulates streak on consecutive wins", () => {
    const date1 = new Date("2026-01-01");
    const date2 = new Date("2026-01-08");
    const result = computeStatsForUsers([
      {
        userId: "p1",
        position: 0,
        resultConfirmed: true,
        attendance: "ATTENDED",
        match: { status: "CONFIRMED", score: "6-4", date: date1 },
      },
      {
        userId: "p1",
        position: 0,
        resultConfirmed: true,
        attendance: "ATTENDED",
        match: { status: "CONFIRMED", score: "6-3", date: date2 },
      },
    ]);
    const stats = result.get("p1")!;
    expect(stats.wins).toBe(2);
    expect(stats.streak).toBe(2);
  });

  it("resets streak to -1 after a loss following wins", () => {
    const result = computeStatsForUsers([
      {
        userId: "p1",
        position: 0,
        resultConfirmed: true,
        attendance: "ATTENDED",
        match: { status: "CONFIRMED", score: "6-4", date: new Date("2026-01-01") },
      },
      {
        userId: "p1",
        position: 0,
        resultConfirmed: true,
        attendance: "ATTENDED",
        match: { status: "CONFIRMED", score: "4-6", date: new Date("2026-01-08") },
      },
    ]);
    const stats = result.get("p1")!;
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(1);
    expect(stats.streak).toBe(-1);
  });

  it("tracks no-show penalties", () => {
    const result = computeStatsForUsers([
      {
        userId: "p1",
        position: 0,
        resultConfirmed: true,
        attendance: "NO_SHOW",
        match: { status: "CONFIRMED", score: "6-4", date: new Date() },
      },
    ]);
    const stats = result.get("p1")!;
    expect(stats.noShowCount).toBe(1);
    expect(stats.noShowPenalty).toBe(25);
  });

  it("tracks late penalties", () => {
    const result = computeStatsForUsers([
      {
        userId: "p1",
        position: 0,
        resultConfirmed: true,
        attendance: "LATE",
        match: { status: "CONFIRMED", score: "6-4", date: new Date() },
      },
    ]);
    const stats = result.get("p1")!;
    expect(stats.lateCount).toBe(1);
    expect(stats.latePenalty).toBe(10);
  });

  it("skips non-CONFIRMED matches for win/loss stats", () => {
    const result = computeStatsForUsers([
      {
        userId: "p1",
        position: 0,
        resultConfirmed: true,
        attendance: null,
        match: { status: "PENDING", score: "6-4", date: new Date() },
      },
    ]);
    const stats = result.get("p1")!;
    expect(stats.wins).toBe(0);
    expect(stats.matchesPlayed).toBe(0);
    expect(stats.totalMatchesCount).toBe(1);
    expect(stats.confirmedMatchesCount).toBe(1);
  });

  it("updates lastMatchAt to most recent match", () => {
    const date1 = new Date("2026-01-01");
    const date2 = new Date("2026-06-01");
    const result = computeStatsForUsers([
      {
        userId: "p1",
        position: 0,
        resultConfirmed: true,
        attendance: "ATTENDED",
        match: { status: "CONFIRMED", score: "6-4", date: date1 },
      },
      {
        userId: "p1",
        position: 0,
        resultConfirmed: true,
        attendance: "ATTENDED",
        match: { status: "CONFIRMED", score: "6-3", date: date2 },
      },
    ]);
    const stats = result.get("p1")!;
    expect(stats.lastMatchAt).toEqual(date2);
  });

  it("calculates setsWonBonus for winner (2 points per set won)", () => {
    const result = computeStatsForUsers([
      {
        userId: "p1",
        position: 0, // team A
        resultConfirmed: true,
        attendance: "ATTENDED",
        match: { status: "CONFIRMED", score: "6-4, 6-3", date: new Date() },
      },
    ]);
    const stats = result.get("p1")!;
    // Winner won 2 sets, bonus = 2 * 2 = 4
    expect(stats.setsWonBonus).toBe(4);
  });

  it("calculates setsWonBonus for loser (1 point per set won)", () => {
    const result = computeStatsForUsers([
      {
        userId: "p1",
        position: 2, // team B (loser)
        resultConfirmed: true,
        attendance: "ATTENDED",
        match: { status: "CONFIRMED", score: "6-4, 6-3", date: new Date() },
      },
    ]);
    const stats = result.get("p1")!;
    // Loser won 0 sets, bonus = 0
    expect(stats.setsWonBonus).toBe(0);
  });

  it("handles multiple users in the same match", () => {
    const date = new Date();
    const result = computeStatsForUsers([
      {
        userId: "p-a1",
        position: 0,
        resultConfirmed: true,
        attendance: "ATTENDED",
        match: { status: "CONFIRMED", score: "6-4", date },
      },
      {
        userId: "p-b1",
        position: 2,
        resultConfirmed: true,
        attendance: "ATTENDED",
        match: { status: "CONFIRMED", score: "6-4", date },
      },
    ]);
    expect(result.get("p-a1")!.wins).toBe(1);
    expect(result.get("p-b1")!.losses).toBe(1);
  });
});
