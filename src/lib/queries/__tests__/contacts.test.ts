import { describe, it, expect } from "vitest";
import { buildContactsMap } from "@/lib/queries/contacts";

function makeMatch(
  date: Date,
  players: Array<{ id: string; displayName: string; alias: string | null; image: string | null; level: number }>,
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
        { id: "user-1", displayName: "Me", alias: null, image: null, level: 5 },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null, level: 6 },
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
        { id: "user-1", displayName: "Me", alias: null, image: null, level: 5 },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null, level: 6 },
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
        { id: "user-1", displayName: "Me", alias: null, image: null, level: 5 },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null, level: 6 },
        { id: "user-3", displayName: "Carl", alias: "carl", image: null, level: 7 },
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
        { id: "user-1", displayName: "Me", alias: null, image: null, level: 5 },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null, level: 6 },
      ]),
      makeMatch(date2, [
        { id: "user-1", displayName: "Me", alias: null, image: null, level: 5 },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null, level: 6 },
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
        { id: "user-1", displayName: "Me", alias: null, image: null, level: 5 },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null, level: 6 },
      ]),
      makeMatch(date2, [
        { id: "user-1", displayName: "Me", alias: null, image: null, level: 5 },
        { id: "user-2", displayName: "Bob", alias: "bob", image: null, level: 6 },
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
        { id: "user-1", displayName: "Me", alias: null, image: null, level: 5 },
        { id: "old-friend", displayName: "Old", alias: null, image: null, level: 4 },
      ]),
      makeMatch(date2, [
        { id: "user-1", displayName: "Me", alias: null, image: null, level: 5 },
        { id: "new-friend", displayName: "New", alias: null, image: null, level: 6 },
      ]),
      makeMatch(date3, [
        { id: "user-1", displayName: "Me", alias: null, image: null, level: 5 },
        { id: "mid-friend", displayName: "Mid", alias: null, image: null, level: 5 },
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
          { user: { id: "user-2", displayName: "Bob", alias: "bob", image: null, level: 6 } },
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
        { id: "user-1", displayName: "Me", alias: null, image: null, level: 5 },
        { id: "user-2", displayName: "Bob", alias: "bobby", image: "img.png", level: 6 },
      ]),
    ];
    const contacts = buildContactsMap(matches, "user-1");
    expect(contacts[0]).toEqual({
      id: "user-2",
      displayName: "Bob",
      alias: "bobby",
      image: "img.png",
      level: 6,
      lastMatchAt: date,
      matchesTogether: 1,
    });
  });
});
