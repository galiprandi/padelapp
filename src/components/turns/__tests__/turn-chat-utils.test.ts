import { describe, it, expect } from "vitest";
import { formatChatTime } from "../turn-chat-utils";

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
