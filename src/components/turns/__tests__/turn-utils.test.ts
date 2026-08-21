import { describe, it, expect } from "vitest";
import {
  formatWhatsAppInviteMessage,
  getOpenSlotsBadgeText,
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
