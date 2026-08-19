import { describe, it, expect } from "vitest";
import { formatChatTime, CHAT_QUICK_SUGGESTIONS } from "../turn-chat-utils";

describe("CHAT_QUICK_SUGGESTIONS", () => {
  it("contains valid quick chip presets for Turn Chat coordination", () => {
    expect(CHAT_QUICK_SUGGESTIONS.length).toBeGreaterThan(0);
    for (const chip of CHAT_QUICK_SUGGESTIONS) {
      expect(chip.id).toBeTruthy();
      expect(chip.label).toBeTruthy();
      expect(chip.text).toBeTruthy();
      expect(chip.text.length).toBeLessThanOrEqual(300);
    }
  });

  it("includes essential padel coordination presets", () => {
    const ids = CHAT_QUICK_SUGGESTIONS.map((c) => c.id);
    expect(ids).toContain("late");
    expect(ids).toContain("balls");
    expect(ids).toContain("confirmed");
    expect(ids).toContain("court");
  });
});

describe("formatChatTime", () => {
  // Use a fixed base date for deterministic assertions: Wednesday, Aug 12, 2026, 15:30:00
  const baseDate = new Date("2026-08-12T15:30:00");

  it("formats today's messages as HH:MM", () => {
    const ts = Math.floor(new Date("2026-08-12T12:15:00").getTime() / 1000);
    expect(formatChatTime(ts, baseDate)).toBe("12:15");
  });

  it("formats yesterday's messages as 'Ayer, HH:MM'", () => {
    const ts = Math.floor(new Date("2026-08-11T19:45:00").getTime() / 1000);
    expect(formatChatTime(ts, baseDate)).toBe("Ayer, 19:45");
  });

  it("formats older messages as 'D/M, HH:MM'", () => {
    const ts = Math.floor(new Date("2026-08-05T08:30:00").getTime() / 1000);
    expect(formatChatTime(ts, baseDate)).toBe("5/8, 08:30");
  });

  it("formats older messages from a previous month correctly", () => {
    const ts = Math.floor(new Date("2026-07-25T14:00:00").getTime() / 1000);
    expect(formatChatTime(ts, baseDate)).toBe("25/7, 14:00");
  });
});
