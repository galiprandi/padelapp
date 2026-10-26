import { describe, it, expect, vi } from "vitest";
import {
  buildContactsMap,
  getTurnNetworkContacts,
  getPadelContacts,
  getCachedPadelContacts,
  getCachedTurnNetworkContacts,
  calculatePadelContactAriaLabel,
  calculateNetworkContactPriorityScore,
  formatNetworkContactSummary,
  getNetworkContactBadgeText,
  getNetworkContactBadgeStyle,
  getNetworkContactMatchCountText,
  getNetworkContactFormattedDate,
  isExtremeRivalOutcome,
  determineTurnNeededCourtSide,
  calculateCandidateProximityBonus,
  calculateCandidateFeedbackAdjustment,
  convertEdgesToGraphLinks,
  formatEnrolledPlayersInput,
  buildTurnNetworkContactsList,
  type PadelContact,
} from "@/lib/queries/contacts";

vi.mock("next/cache", () => ({
  // Mirrors the real unstable_cache contract: values crossing the cache
  // boundary are JSON-serialized. If a query is ever moved back from
  // "use cache" to unstable_cache, Date fields arrive as strings and the
  // Date-instance contract tests below fail — that is the regression net.
  unstable_cache:
    (fn: (...args: unknown[]) => Promise<unknown>) =>
    async (...args: unknown[]) =>
      JSON.parse(JSON.stringify(await fn(...args))),
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
  revalidateTag: vi.fn(),
}));

function makeMatch(
  date: Date,
  players: Array<{ id: string; displayName: string; alias: string | null; image: string | null }>,
) {
  return {
    date,
    players: players.map((p) => ({ user: p })),
  };
}

describe("buildContactsMap", () => {
  it("returns empty array for no matches", () => {
    expect(buildContactsMap([], "user-1")).toEqual([]);
  });

  it("excludes the user themselves (string excludeIds)", () => {
    const date = new Date("2026-01-01");
    const matches = [
      makeMatch(date, [
        { id: "user-1", displayName: "Me", alias: null, image: null },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null },
      ]),
    ];
    const contacts = buildContactsMap(matches, "user-1");
    expect(contacts).toHaveLength(1);
    expect(contacts[0].id).toBe("user-2");
  });

  it("excludes the user themselves (Set excludeIds)", () => {
    const date = new Date("2026-01-01");
    const matches = [
      makeMatch(date, [
        { id: "user-1", displayName: "Me", alias: null, image: null },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null },
      ]),
    ];
    const contacts = buildContactsMap(matches, new Set(["user-1"]));
    expect(contacts).toHaveLength(1);
    expect(contacts[0].id).toBe("user-2");
  });

  it("excludes multiple users (Set mode for turn network)", () => {
    const date = new Date("2026-01-01");
    const matches = [
      makeMatch(date, [
        { id: "user-1", displayName: "Me", alias: null, image: null },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null },
        { id: "user-3", displayName: "Carl", alias: "carl", image: null },
      ]),
    ];
    const contacts = buildContactsMap(matches, new Set(["user-1", "user-2"]));
    expect(contacts).toHaveLength(1);
    expect(contacts[0].id).toBe("user-3");
  });

  it("counts matchesTogether correctly for repeat contacts", () => {
    const date1 = new Date("2026-01-01");
    const date2 = new Date("2026-02-01");
    const matches = [
      makeMatch(date1, [
        { id: "user-1", displayName: "Me", alias: null, image: null },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null },
      ]),
      makeMatch(date2, [
        { id: "user-1", displayName: "Me", alias: null, image: null },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null },
      ]),
    ];
    const contacts = buildContactsMap(matches, "user-1");
    expect(contacts[0].matchesTogether).toBe(2);
  });

  it("updates lastMatchAt to most recent match", () => {
    const date1 = new Date("2026-01-01");
    const date2 = new Date("2026-06-01");
    const matches = [
      makeMatch(date1, [
        { id: "user-1", displayName: "Me", alias: null, image: null },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null },
      ]),
      makeMatch(date2, [
        { id: "user-1", displayName: "Me", alias: null, image: null },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null },
      ]),
    ];
    const contacts = buildContactsMap(matches, "user-1");
    expect(contacts[0].lastMatchAt).toEqual(date2);
  });

  it("sorts contacts by lastMatchAt descending (most recent first)", () => {
    const date1 = new Date("2026-01-01");
    const date2 = new Date("2026-06-01");
    const date3 = new Date("2026-03-01");
    const matches = [
      makeMatch(date1, [
        { id: "user-1", displayName: "Me", alias: null, image: null },
        { id: "old-friend", displayName: "Old", alias: null, image: null },
      ]),
      makeMatch(date2, [
        { id: "user-1", displayName: "Me", alias: null, image: null },
        { id: "new-friend", displayName: "New", alias: null, image: null },
      ]),
      makeMatch(date3, [
        { id: "user-1", displayName: "Me", alias: null, image: null },
        { id: "mid-friend", displayName: "Mid", alias: null, image: null },
      ]),
    ];
    const contacts = buildContactsMap(matches, "user-1");
    expect(contacts[0].id).toBe("new-friend");
    expect(contacts[1].id).toBe("mid-friend");
    expect(contacts[2].id).toBe("old-friend");
  });

  it("skips players with null user", () => {
    const date = new Date("2026-01-01");
    const matches = [
      {
        date,
        players: [
          { user: null },
          { user: { id: "user-2", displayName: "Bob", alias: "bob", image: null } },
        ],
      },
    ];
    const contacts = buildContactsMap(matches, "user-1");
    expect(contacts).toHaveLength(1);
    expect(contacts[0].id).toBe("user-2");
  });

  it("maps all PadelContact fields correctly", () => {
    const date = new Date("2026-01-01");
    const matches = [
      makeMatch(date, [
        { id: "user-1", displayName: "Me", alias: null, image: null },
        { id: "user-2", displayName: "Bob", alias: "bobby", image: "img.png" },
      ]),
    ];
    const contacts = buildContactsMap(matches, "user-1");
    expect(contacts[0]).toEqual({
      id: "user-2",
      displayName: "Bob",
      alias: "bobby",
      image: "img.png",
      lastMatchAt: date,
      matchesTogether: 1,
    });
  });
});

describe("getPadelContacts and getTurnNetworkContacts under MOCK_AUTH/AUTH_BYPASS", () => {
  it("returns mock turn network contacts with turn rescue proximity badges under mock conditions", async () => {
    process.env.MOCK_AUTH = "true";
    const contacts = await getTurnNetworkContacts("turn-01");
    expect(contacts).toHaveLength(2);
    expect(contacts[0].id).toBe("p-03");
    expect(contacts[0].proximityTier).toBe("Ideal 🎯");
    expect(contacts[0].proximitySummary).toContain("Score cercano");
    expect(contacts[0].badgeStyle).toContain("bg-emerald-100");

    expect(contacts[1].id).toBe("p-04");
    expect(contacts[1].proximityTier).toBe("Buena opción 👍");
    expect(contacts[1].badgeStyle).toContain("bg-sky-100");
  });

  it("returns mock padel contacts under MOCK_AUTH/AUTH_BYPASS conditions", async () => {
    process.env.MOCK_AUTH = "true";
    const contacts = await getPadelContacts("p-01");
    expect(contacts).toHaveLength(3);
    expect(contacts[0].id).toBe("p-02");
    expect(contacts[0].displayName).toBe("Fernando Belasteguín");
    expect(contacts[1].id).toBe("p-03");
    expect(contacts[2].id).toBe("p-04");
  });

  it("returns cached mock padel contacts via getCachedPadelContacts", async () => {
    process.env.AUTH_BYPASS = "true";
    const contacts = await getCachedPadelContacts("p-01");
    expect(contacts).toHaveLength(3);
    expect(contacts[0].id).toBe("p-02");
    expect(contacts[0].matchesTogether).toBe(12);
  });
});

describe("cached contact queries preserve Date instances", () => {
  // Regression: unstable_cache JSON-serializes results, so lastMatchAt came
  // back as a string and calculatePadelContactAriaLabel crashed on /t/[id].
  // These assertions fail if the queries ever go back through a
  // JSON-serializing cache layer.
  it("getCachedPadelContacts returns lastMatchAt as Date", async () => {
    process.env.AUTH_BYPASS = "true";
    const contacts = await getCachedPadelContacts("p-01");
    expect(contacts.length).toBeGreaterThan(0);
    for (const c of contacts) {
      expect(c.lastMatchAt).toBeInstanceOf(Date);
    }
  });

  it("getCachedTurnNetworkContacts returns lastMatchAt as Date", async () => {
    process.env.AUTH_BYPASS = "true";
    const contacts = await getCachedTurnNetworkContacts("turn-01");
    expect(contacts.length).toBeGreaterThan(0);
    for (const c of contacts) {
      expect(c.lastMatchAt).toBeInstanceOf(Date);
    }
  });
});

describe("calculatePadelContactAriaLabel", () => {
  it("formats accessible ARIA label with alias, plural matches and date", () => {
    const contact: PadelContact = {
      id: "p-03",
      displayName: "Diego Morales",
      alias: "Gero",
      image: null,
      lastMatchAt: new Date("2026-05-15T12:00:00Z"),
      matchesTogether: 5,
    };

    const label = calculatePadelContactAriaLabel(contact);
    expect(label).toContain("Gero");
    expect(label).toContain("5 partidos compartidos");
    expect(label).toContain("Último partido el 15/5/2026");
  });

  it("uses displayName when alias is null and handles singular match count", () => {
    const contact: PadelContact = {
      id: "p-04",
      displayName: "Facundo Lopez",
      alias: null,
      image: null,
      lastMatchAt: new Date("2026-08-10T12:00:00Z"),
      matchesTogether: 1,
    };

    const label = calculatePadelContactAriaLabel(contact);
    expect(label).toContain("Facundo Lopez");
    expect(label).toContain("1 partido compartido");
    expect(label).toContain("Último partido el 10/8/2026");
  });

  it("accepts an ISO string lastMatchAt without crashing (serialized payloads)", () => {
    const contact: PadelContact = {
      id: "p-03",
      displayName: "Diego Morales",
      alias: "Gero",
      image: null,
      lastMatchAt: "2026-05-15T12:00:00Z" as unknown as Date,
      matchesTogether: 5,
    };

    const label = calculatePadelContactAriaLabel(contact);
    expect(label).toContain("Gero");
    expect(label).toContain("Último partido el 15/5/2026");
  });

  it("handles empty or missing lastMatchAt gracefully", () => {
    const contact: PadelContact = {
      id: "p-05",
      displayName: "Jugador Nuevo",
      alias: null,
      image: null,
      lastMatchAt: new Date(0),
      matchesTogether: 2,
    };

    const label = calculatePadelContactAriaLabel(contact);
    expect(label).toBe("Jugador Nuevo: 2 partidos compartidos.");
  });

  it("includes turn rescue proximity tier and summary in ARIA label when available", () => {
    const contact: PadelContact = {
      id: "p-03",
      displayName: "Diego Morales",
      alias: "Gero",
      image: null,
      lastMatchAt: new Date("2026-05-15T12:00:00Z"),
      matchesTogether: 5,
      proximityTier: "Ideal 🎯",
      proximitySummary: "Score cercano (dif. 50) · Equilibra posición en cancha",
    };

    const label = calculatePadelContactAriaLabel(contact);
    expect(label).toContain("Gero: 5 partidos compartidos.");
    expect(label).toContain("Último partido el 15/5/2026.");
    expect(label).toContain("Compatibilidad de salvataje: Ideal 🎯. Score cercano (dif. 50) · Equilibra posición en cancha.");
  });
});

describe("Skill proximity and side preference synergy scoring rules", () => {
  it("calculates proximity bonus and side preference bonus correctly", () => {
    // Proximity logic check
    const avgScore = 1050;

    const candCloseScore = 1100; // diff 50 -> <= 100 -> +60
    const candMidScore = 1200; // diff 150 -> <= 200 -> +30
    const candFarScore = 1450; // diff 400 -> > 350 -> -50

    const calcProximity = (score: number) => {
      const diff = Math.abs(score - avgScore);
      if (diff <= 100) return 60;
      if (diff <= 200) return 30;
      if (diff > 350) return -50;
      return 0;
    };

    expect(calcProximity(candCloseScore)).toBe(60);
    expect(calcProximity(candMidScore)).toBe(30);
    expect(calcProximity(candFarScore)).toBe(-50);

    // Needed side logic check
    const enrolledSides = ["RIGHT", "RIGHT", "LEFT"];
    const rightCount = enrolledSides.filter((s) => s === "RIGHT").length;
    const leftCount = enrolledSides.filter((s) => s === "LEFT").length;
    const neededSide = rightCount > leftCount ? "LEFT" : leftCount > rightCount ? "RIGHT" : null;

    expect(neededSide).toBe("LEFT");
  });
});

describe("isExtremeRivalOutcome", () => {
  it("returns false if rival matches are less than 2", () => {
    expect(isExtremeRivalOutcome(1, 1)).toBe(false);
    expect(isExtremeRivalOutcome(0, 1)).toBe(false);
    expect(isExtremeRivalOutcome(0, 0)).toBe(false);
  });

  it("returns true for extreme candidate win rates (>85% or <15%)", () => {
    // 9 out of 10 = 90% > 85%
    expect(isExtremeRivalOutcome(9, 10)).toBe(true);
    // 1 out of 10 = 10% < 15%
    expect(isExtremeRivalOutcome(1, 10)).toBe(true);
  });

  it("returns false for balanced rival win rates (between 15% and 85%)", () => {
    // 5 out of 10 = 50%
    expect(isExtremeRivalOutcome(5, 10)).toBe(false);
    // 2 out of 10 = 20%
    expect(isExtremeRivalOutcome(2, 10)).toBe(false);
    // 8 out of 10 = 80%
    expect(isExtremeRivalOutcome(8, 10)).toBe(false);
  });
});

describe("determineTurnNeededCourtSide", () => {
  it("returns LEFT when right side players outnumber left side players", () => {
    expect(determineTurnNeededCourtSide(2, 1)).toBe("LEFT");
    expect(determineTurnNeededCourtSide(3, 0)).toBe("LEFT");
  });

  it("returns RIGHT when left side players outnumber right side players", () => {
    expect(determineTurnNeededCourtSide(1, 2)).toBe("RIGHT");
    expect(determineTurnNeededCourtSide(0, 2)).toBe("RIGHT");
  });

  it("returns null when right side and left side player counts are equal", () => {
    expect(determineTurnNeededCourtSide(1, 1)).toBe(null);
    expect(determineTurnNeededCourtSide(0, 0)).toBe(null);
  });
});

describe("calculateCandidateProximityBonus", () => {
  it("calculates proximity bonus for close skill score (diff <= 100) and matching court side", () => {
    // skill diff = 50 -> +60, needed side match -> +40 -> total = 100
    const bonus = calculateCandidateProximityBonus(1050, 1000, "LEFT", "LEFT");
    expect(bonus).toBe(100);
  });

  it("calculates proximity bonus for moderate skill score diff (<= 200) without side match", () => {
    // skill diff = 150 -> +30, side mismatch -> 0 -> total = 30
    const bonus = calculateCandidateProximityBonus(1150, 1000, "RIGHT", "LEFT");
    expect(bonus).toBe(30);
  });

  it("penalizes large skill score diff (> 350)", () => {
    // skill diff = 400 -> -50, no needed side -> 0 -> total = -50
    const bonus = calculateCandidateProximityBonus(1400, 1000, "RIGHT", null);
    expect(bonus).toBe(-50);
  });
});

describe("calculateCandidateFeedbackAdjustment", () => {
  it("ignores feedback for already enrolled participants", () => {
    const feedbackRows = [
      { playerId: "p-01", feedback: "WEAKER" },
      { playerId: "p-01", feedback: "WEAKER" },
    ];
    const participantUserIds = new Set(["p-01"]);
    const result = calculateCandidateFeedbackAdjustment(feedbackRows, participantUserIds);

    expect(result.scoreAdjustments.size).toBe(0);
    expect(result.excludedUserIds.size).toBe(0);
  });

  it("calculates score penalties and excludes candidates with severe net negative feedback (>= 2)", () => {
    const feedbackRows = [
      { playerId: "candidate-1", feedback: "WEAKER" },
      { playerId: "candidate-1", feedback: "WEAKER" },
      { playerId: "candidate-2", feedback: "WEAKER" },
      { playerId: "candidate-2", feedback: "STRONGER" },
    ];
    const participantUserIds = new Set(["p-01"]);
    const result = calculateCandidateFeedbackAdjustment(feedbackRows, participantUserIds);

    // candidate-1: netNegative = 2 -> penalty = -300, excluded
    expect(result.scoreAdjustments.get("candidate-1")).toBe(-300);
    expect(result.excludedUserIds.has("candidate-1")).toBe(true);

    // candidate-2: netNegative = 0 -> no penalty, not excluded
    expect(result.scoreAdjustments.has("candidate-2")).toBe(false);
    expect(result.excludedUserIds.has("candidate-2")).toBe(false);
  });
});

describe("calculateNetworkContactPriorityScore", () => {
  it("calculates base match and turn score with recency bonus (<30 days)", () => {
    const recentDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    // 2 rivals + 3 partners = 5 matches * 10 = 50. 2 turns * 5 = 10. Recency (<30) = +50 -> total 110.
    const score = calculateNetworkContactPriorityScore(2, 3, 2, recentDate);
    expect(score).toBe(110);
  });

  it("applies recency bonus tiers correctly (<60 days and <120 days)", () => {
    const date40Days = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
    const date90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const date150Days = new Date(Date.now() - 150 * 24 * 60 * 60 * 1000);

    // Matches: 1 rival + 1 partner = 2 * 10 = 20. Turns: 0.
    expect(calculateNetworkContactPriorityScore(1, 1, 0, date40Days)).toBe(20 + 30); // 50
    expect(calculateNetworkContactPriorityScore(1, 1, 0, date90Days)).toBe(20 + 15); // 35
    expect(calculateNetworkContactPriorityScore(1, 1, 0, date150Days)).toBe(20); // 20
    expect(calculateNetworkContactPriorityScore(1, 1, 0, null)).toBe(20); // 20
  });
});

describe("getNetworkContactBadgeText", () => {
  it("returns habitual pair badge text for 10 or more matches", () => {
    expect(getNetworkContactBadgeText(10)).toBe("Dupla habitual 🏆");
    expect(getNetworkContactBadgeText(25)).toBe("Dupla habitual 🏆");
  });

  it("returns frequent badge text for 5 to 9 matches", () => {
    expect(getNetworkContactBadgeText(5)).toBe("Frecuente 🤝");
    expect(getNetworkContactBadgeText(9)).toBe("Frecuente 🤝");
  });

  it("returns network contact badge text for 1 to 4 matches", () => {
    expect(getNetworkContactBadgeText(1)).toBe("Contacto de red 🎾");
    expect(getNetworkContactBadgeText(4)).toBe("Contacto de red 🎾");
  });

  it("returns new contact badge text for 0 matches", () => {
    expect(getNetworkContactBadgeText(0)).toBe("Nuevo contacto 🌱");
  });
});

describe("getNetworkContactBadgeStyle", () => {
  it("returns emerald badge style for habitual pair (>= 10 matches)", () => {
    const style = getNetworkContactBadgeStyle(10);
    expect(style).toContain("bg-emerald-100");
    expect(style).toContain("text-emerald-800");
  });

  it("returns sky badge style for frequent contacts (5 to 9 matches)", () => {
    const style = getNetworkContactBadgeStyle(6);
    expect(style).toContain("bg-sky-100");
    expect(style).toContain("text-sky-800");
  });

  it("returns slate badge style for standard network contacts (1 to 4 matches)", () => {
    const style = getNetworkContactBadgeStyle(2);
    expect(style).toContain("bg-slate-100");
    expect(style).toContain("text-slate-800");
  });

  it("returns muted badge style for new contacts (0 matches)", () => {
    const style = getNetworkContactBadgeStyle(0);
    expect(style).toBe("bg-muted text-muted-foreground border-border");
  });
});

describe("getNetworkContactMatchCountText", () => {
  it("formats singular match count text", () => {
    expect(getNetworkContactMatchCountText(1)).toBe("1 partido");
  });

  it("formats plural match count text", () => {
    expect(getNetworkContactMatchCountText(0)).toBe("0 partidos");
    expect(getNetworkContactMatchCountText(5)).toBe("5 partidos");
    expect(getNetworkContactMatchCountText(12)).toBe("12 partidos");
  });
});

describe("getNetworkContactFormattedDate", () => {
  it("formats Date instances into Argentine date string", () => {
    const date = new Date("2026-06-15T12:00:00Z");
    expect(getNetworkContactFormattedDate(date)).toBe("15/6/2026");
  });

  it("formats ISO date strings and timestamps", () => {
    expect(getNetworkContactFormattedDate("2026-08-10T12:00:00Z")).toBe("10/8/2026");
    expect(getNetworkContactFormattedDate(1778846400000)).toBe("15/5/2026");
  });

  it("returns empty string for null, undefined, invalid, or epoch zero dates", () => {
    expect(getNetworkContactFormattedDate(null)).toBe("");
    expect(getNetworkContactFormattedDate(undefined)).toBe("");
    expect(getNetworkContactFormattedDate("invalid-date")).toBe("");
    expect(getNetworkContactFormattedDate(new Date(0))).toBe("");
  });
});

describe("convertEdgesToGraphLinks", () => {
  it("converts playerEdges into GraphLink objects", () => {
    const edges = [
      {
        id: "e1",
        playerAId: "p-01",
        playerBId: "p-02",
        matchesAsRivals: 3,
        matchesAsPartners: 2,
        winsA: 2,
        winsB: 1,
        winsTogether: 1,
        lossesTogether: 1,
        turnsTogether: 4,
        lastMatchAt: new Date(),
        lastTurnAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const links = convertEdgesToGraphLinks(
      edges as unknown as Parameters<typeof convertEdgesToGraphLinks>[0]
    );
    expect(links).toHaveLength(1);
    expect(links[0]).toEqual({
      source: "p-01",
      target: "p-02",
      rivalMatches: 3,
      partnerMatches: 2,
      winsA: 2,
      winsB: 1,
      winsTogether: 1,
      lossesTogether: 1,
      turnsTogether: 4,
      strength: 9,
    });
  });
});

describe("formatEnrolledPlayersInput", () => {
  it("formats playerGraphStats for enrolled players into proximity calculation input", () => {
    const stats = [
      {
        userId: "p-01",
        skillScore: 1100,
        preferredSide: "RIGHT",
        community: 1,
        networkSize: 5,
        updatedAt: new Date(),
      },
    ];

    const formatted = formatEnrolledPlayersInput(
      stats as unknown as Parameters<typeof formatEnrolledPlayersInput>[0]
    );
    expect(formatted).toEqual([
      {
        id: "p-01",
        skillScore: 1100,
        preferredSide: "RIGHT",
        community: 1,
      },
    ]);
  });
});

describe("buildTurnNetworkContactsList", () => {
  it("builds and ranks candidates by recommendation score descending", () => {
    const candidatesData = [
      { id: "cand-1", displayName: "Candidate One", alias: "C1", image: null },
      { id: "cand-2", displayName: "Candidate Two", alias: "C2", image: null },
    ];

    const candidateScores = new Map([
      ["cand-1", 100],
      ["cand-2", 200],
    ]);

    const candidateDirectMatches = new Map([
      ["cand-1", { lastMatchAt: new Date("2026-05-01"), matchesTogether: 2 }],
      ["cand-2", { lastMatchAt: new Date("2026-06-01"), matchesTogether: 4 }],
    ]);

    const candidateStatsMap = new Map([
      [
        "cand-1",
        {
          userId: "cand-1",
          skillScore: 1000,
          preferredSide: "RIGHT",
          community: 1,
        } as unknown as Parameters<typeof buildTurnNetworkContactsList>[3] extends Map<string, infer V> ? V : never,
      ],
      [
        "cand-2",
        {
          userId: "cand-2",
          skillScore: 1050,
          preferredSide: "LEFT",
          community: 1,
        } as unknown as Parameters<typeof buildTurnNetworkContactsList>[3] extends Map<string, infer V> ? V : never,
      ],
    ]);

    const enrolledPlayersInput = [
      { id: "enrolled-1", skillScore: 1000, preferredSide: "RIGHT", community: 1 },
    ];

    const graphLinks = [
      {
        source: "cand-1",
        target: "enrolled-1",
        rivalMatches: 1,
        partnerMatches: 1,
        winsA: 1,
        winsB: 0,
        winsTogether: 1,
        lossesTogether: 0,
        turnsTogether: 0,
        strength: 2,
      },
    ];

    const list = buildTurnNetworkContactsList(
      candidatesData,
      candidateScores,
      candidateDirectMatches,
      candidateStatsMap,
      enrolledPlayersInput,
      graphLinks
    );

    expect(list).toHaveLength(2);
    // cand-2 has higher score (200), so it comes first
    expect(list[0].id).toBe("cand-2");
    expect(list[1].id).toBe("cand-1");
    expect(list[0].displayName).toBe("Candidate Two");
  });
});

describe("formatNetworkContactSummary", () => {
  it("formats summary with habitual pair badge for >=10 matches", () => {
    const contact: PadelContact = {
      id: "p-01",
      displayName: "Fernando Belasteguín",
      alias: "Bela",
      image: null,
      lastMatchAt: new Date("2026-06-15T12:00:00Z"),
      matchesTogether: 12,
    };

    const summary = formatNetworkContactSummary(contact);
    expect(summary.matchCountText).toBe("12 partidos");
    expect(summary.badgeText).toBe("Dupla habitual 🏆");
    expect(summary.recencyText).toBe("15/6/2026");
    expect(summary.ariaLabel).toContain("Bela");
    expect(summary.ariaLabel).toContain("12 partidos compartidos");
  });

  it("formats summary with frequent badge for >=5 matches", () => {
    const contact: PadelContact = {
      id: "p-02",
      displayName: "Diego Morales",
      alias: "Gero",
      image: null,
      lastMatchAt: new Date("2026-05-10T12:00:00Z"),
      matchesTogether: 6,
    };

    const summary = formatNetworkContactSummary(contact);
    expect(summary.matchCountText).toBe("6 partidos");
    expect(summary.badgeText).toBe("Frecuente 🤝");
    expect(summary.recencyText).toBe("10/5/2026");
  });

  it("formats summary for singular match count", () => {
    const contact: PadelContact = {
      id: "p-03",
      displayName: "Facundo Lopez",
      alias: null,
      image: null,
      lastMatchAt: new Date("2026-01-20T12:00:00Z"),
      matchesTogether: 1,
    };

    const summary = formatNetworkContactSummary(contact);
    expect(summary.matchCountText).toBe("1 partido");
    expect(summary.badgeText).toBe("Contacto de red 🎾");
    expect(summary.recencyText).toBe("20/1/2026");
  });

  it("handles contact with zero matches and null/empty lastMatchAt", () => {
    const contact: PadelContact = {
      id: "p-04",
      displayName: "Nuevo Jugador",
      alias: null,
      image: null,
      lastMatchAt: new Date(0),
      matchesTogether: 0,
    };

    const summary = formatNetworkContactSummary(contact);
    expect(summary.matchCountText).toBe("0 partidos");
    expect(summary.badgeText).toBe("Nuevo contacto 🌱");
    expect(summary.recencyText).toBe("");
    expect(summary.ariaLabel).toBe("Nuevo Jugador: 0 partidos compartidos.");
  });
});
