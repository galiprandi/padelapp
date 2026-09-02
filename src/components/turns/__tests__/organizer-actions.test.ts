import { describe, it, expect } from "vitest";
import { getOpenSlotsBadgeText, getTurnUrgencyBadgeText, getTurnSalvageShareMessage } from "../turn-utils";

describe("Turn Utils & Organizer Helpers", () => {
  it("formats open slot badge text correctly", () => {
    expect(getOpenSlotsBadgeText(1)).toBe("Falta 1");
    expect(getOpenSlotsBadgeText(2)).toBe("Faltan 2");
    expect(getOpenSlotsBadgeText(3)).toBe("Faltan 3");
  });

  it("computes turn urgency badge text accurately", () => {
    const now = new Date("2026-09-01T10:00:00Z").getTime();

    // 30 minutes away (< 1h), not full -> Urgente
    const date30m = new Date("2026-09-01T10:30:00Z");
    expect(getTurnUrgencyBadgeText(date30m, false, now)).toBe("Urgente");

    // Full turn -> no urgency badge
    expect(getTurnUrgencyBadgeText(date30m, true, now)).toBeNull();

    // 2.5 hours away, not full -> En 2h or En 3h depending on rounding
    const date2h = new Date("2026-09-01T12:30:00Z");
    expect(getTurnUrgencyBadgeText(date2h, false, now)).toBe("En 3h");

    // 5 hours away -> null
    const date5h = new Date("2026-09-01T15:00:00Z");
    expect(getTurnUrgencyBadgeText(date5h, false, now)).toBeNull();
  });

  it("generates turn salvage share messages in Argentine Spanish", () => {
    const date = new Date("2026-09-01T18:00:00Z");
    const msg1 = getTurnSalvageShareMessage({
      club: "Club El Balcón",
      date,
      openSlots: 1,
    });
    expect(msg1).toContain("Falta 1 jugador");
    expect(msg1).toContain("Club El Balcón");

    const msg2 = getTurnSalvageShareMessage({
      club: "Padel Central",
      date,
      openSlots: 2,
    });
    expect(msg2).toContain("Faltan 2 jugadores");
    expect(msg2).toContain("Padel Central");
  });
});
