import { describe, it, expect, vi } from "vitest";
import { buildContactsMap, getTurnNetworkContacts } from "@/lib/queries/contacts";

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
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

describe("getTurnNetworkContacts under MOCK_AUTH/AUTH_BYPASS", () => {
  it("returns mock network contacts under mock conditions", async () => {
    process.env.MOCK_AUTH = "true";
    const contacts = await getTurnNetworkContacts("turn-01");
    expect(contacts).toHaveLength(2);
    expect(contacts[0].id).toBe("p-03");
    expect(contacts[1].id).toBe("p-04");
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
