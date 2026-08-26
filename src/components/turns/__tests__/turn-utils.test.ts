import { describe, it, expect } from "vitest";
import {
  formatWhatsAppInviteMessage,
  getTurnSalvageShareMessage,
  getOpenSlotsBadgeText,
  getTurnSalvageBannerText,
  getTurnRoleBadgeText,
  getCooldownRemainingMinutes,
  getTurnUrgencyBadgeText,
} from "../turn-utils";

describe("formatWhatsAppInviteMessage", () => {
  it("formats invite message correctly for 1 open slot", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(19, 0, 0, 0);

    const msg = formatWhatsAppInviteMessage({
      club: "Central Padel",
      date: futureDate,
      contactName: "Mateo",
      openSlots: 1,
      shareUrl: "https://padelred.app/t/123",
    });

    expect(msg).toContain("Hola Mateo, ¿te sumás al turno de pádel en Central Padel");
    expect(msg).toContain("falta 1 jugador para completarlo.");
    expect(msg).toContain("Sumate acá: https://padelred.app/t/123");
    expect(msg).not.toContain("!");
    expect(msg).not.toContain("¡");
  });

  it("formats invite message correctly for multiple open slots", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(20, 30, 0, 0);

    const msg = formatWhatsAppInviteMessage({
      club: "El Balcón",
      date: futureDate,
      contactName: "Agustín",
      openSlots: 2,
      shareUrl: "https://padelred.app/t/456",
    });

    expect(msg).toContain("Hola Agustín, ¿te sumás al turno de pádel en El Balcón");
    expect(msg).toContain("20:30hs");
    expect(msg).toContain("faltan 2 jugadores para completarlo.");
    expect(msg).toContain("Sumate acá: https://padelred.app/t/456");
  });
});

describe("getTurnSalvageShareMessage", () => {
  it("formats turn salvage share message for 1 missing slot", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(19, 0, 0, 0);

    const msg = getTurnSalvageShareMessage({
      club: "Central Padel",
      date: futureDate,
      openSlots: 1,
    });

    expect(msg).toContain("⚠️ Falta 1 jugador para el turno de pádel en Central Padel");
    expect(msg).toContain("Ayudanos a completarlo o sumate acá:");
    expect(msg).not.toContain("!");
    expect(msg).not.toContain("¡");
  });

  it("formats turn salvage share message for multiple missing slots", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(20, 15, 0, 0);

    const msg = getTurnSalvageShareMessage({
      club: "La Cancha Padel",
      date: futureDate,
      openSlots: 2,
    });

    expect(msg).toContain("⚠️ Faltan 2 jugadores para el turno de pádel en La Cancha Padel");
    expect(msg).toContain("20:15hs");
    expect(msg).toContain("Ayudanos a completarlo o sumate acá:");
  });
});

describe("getOpenSlotsBadgeText", () => {
  it("returns empty string when no slots are open", () => {
    expect(getOpenSlotsBadgeText(0)).toBe("");
    expect(getOpenSlotsBadgeText(-1)).toBe("");
  });

  it("returns 'Falta 1' when exactly 1 slot is open", () => {
    expect(getOpenSlotsBadgeText(1)).toBe("Falta 1");
  });

  it("returns 'Faltan X' when more than 1 slot is open", () => {
    expect(getOpenSlotsBadgeText(2)).toBe("Faltan 2");
    expect(getOpenSlotsBadgeText(3)).toBe("Faltan 3");
  });
});

describe("getTurnSalvageBannerText", () => {
  it("returns empty string when no slots are open", () => {
    expect(getTurnSalvageBannerText(0)).toBe("");
    expect(getTurnSalvageBannerText(-1)).toBe("");
  });

  it("formats callout banner text for 1 open slot", () => {
    const text = getTurnSalvageBannerText(1);
    expect(text).toBe("Falta 1 jugador para completar este turno. Sumate o compartilo con tu red para jugar.");
    expect(text).not.toContain("!");
    expect(text).not.toContain("¡");
  });

  it("formats callout banner text for multiple open slots", () => {
    const text = getTurnSalvageBannerText(2);
    expect(text).toBe("Faltan 2 jugadores para completar este turno. Sumate o compartilo con tu red para jugar.");
    expect(text).not.toContain("!");
    expect(text).not.toContain("¡");
  });
});

describe("getTurnRoleBadgeText", () => {
  it("returns 'Organizador' when isCreator is true", () => {
    expect(getTurnRoleBadgeText({ isCreator: true, isJoined: true })).toBe("Organizador");
    expect(getTurnRoleBadgeText({ isCreator: true, isSubstitute: false })).toBe("Organizador");
  });

  it("returns 'Suplente' when isSubstitute is true and not creator", () => {
    expect(getTurnRoleBadgeText({ isCreator: false, isSubstitute: true })).toBe("Suplente");
  });

  it("returns 'Inscripto' when isJoined is true and not creator or substitute", () => {
    expect(getTurnRoleBadgeText({ isCreator: false, isJoined: true })).toBe("Inscripto");
  });

  it("returns null when user has no role in turn", () => {
    expect(getTurnRoleBadgeText({ isCreator: false, isJoined: false, isSubstitute: false })).toBeNull();
  });
});

describe("getCooldownRemainingMinutes", () => {
  it("returns 0 when lastNotificationAt is null or undefined", () => {
    expect(getCooldownRemainingMinutes(null)).toBe(0);
    expect(getCooldownRemainingMinutes(undefined)).toBe(0);
  });

  it("returns remaining minutes rounded up when notification was sent within the last hour", () => {
    const nowMs = 1700000000000;
    // Notification sent 15 minutes ago -> 45 minutes remaining
    const lastNotified = new Date(nowMs - 15 * 60 * 1000);
    expect(getCooldownRemainingMinutes(lastNotified, nowMs)).toBe(45);

    // Notification sent 59 minutes and 10 seconds ago -> 1 minute remaining
    const lastNotified2 = new Date(nowMs - 59 * 60 * 1000 - 10 * 1000);
    expect(getCooldownRemainingMinutes(lastNotified2, nowMs)).toBe(1);
  });

  it("returns 0 when notification was sent 60+ minutes ago", () => {
    const nowMs = 1700000000000;
    const lastNotified = new Date(nowMs - 60 * 60 * 1000);
    expect(getCooldownRemainingMinutes(lastNotified, nowMs)).toBe(0);

    const oldNotified = new Date(nowMs - 2 * 60 * 60 * 1000);
    expect(getCooldownRemainingMinutes(oldNotified, nowMs)).toBe(0);
  });
});

describe("getTurnUrgencyBadgeText", () => {
  const nowMs = 1700000000000;

  it("returns null if turn is full", () => {
    const turnDate = new Date(nowMs + 30 * 60 * 1000); // 30 min away
    expect(getTurnUrgencyBadgeText(turnDate, true, nowMs)).toBeNull();
  });

  it("returns 'Urgente' when turn is less than 1 hour away and incomplete", () => {
    const turnDate = new Date(nowMs + 30 * 60 * 1000); // 30 min away
    expect(getTurnUrgencyBadgeText(turnDate, false, nowMs)).toBe("Urgente");
  });

  it("returns 'En Xh' when turn is between 1 and 3 hours away and incomplete", () => {
    const turnDate2h = new Date(nowMs + 2 * 60 * 60 * 1000); // 2 hours away
    expect(getTurnUrgencyBadgeText(turnDate2h, false, nowMs)).toBe("En 2h");
  });

  it("returns null when turn is in the past or more than 3 hours away", () => {
    const pastDate = new Date(nowMs - 10 * 60 * 1000); // 10 min in the past
    expect(getTurnUrgencyBadgeText(pastDate, false, nowMs)).toBeNull();

    const future4h = new Date(nowMs + 4 * 60 * 60 * 1000); // 4 hours away
    expect(getTurnUrgencyBadgeText(future4h, false, nowMs)).toBeNull();
  });
});
