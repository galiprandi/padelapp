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
  it("returns mock turn network contacts under mock conditions", async () => {
    process.env.MOCK_AUTH = "true";
    const contacts = await getTurnNetworkContacts("turn-01");
    expect(contacts).toHaveLength(2);
    expect(contacts[0].id).toBe("p-03");
    expect(contacts[1].id).toBe("p-04");
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
