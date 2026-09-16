import { describe, it, expect } from "vitest";
import {
  formatChatTime,
  CHAT_QUICK_SUGGESTIONS,
  validateChatMessage,
  getChatMessageAriaLabel,
  getQuickChipAriaLabel,
  getChatRegionAriaLabel,
  getChatLogAriaLabel,
  getChatInputAriaLabel,
  getChatCharacterCounterAriaLabel,
} from "../turn-chat-utils";

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

  it("verifies CHAT_QUICK_SUGGESTIONS accessibility structure", () => {
    CHAT_QUICK_SUGGESTIONS.forEach((chip) => {
      expect(chip.id).toMatch(/^[a-z]+$/);
      expect(typeof chip.label).toBe("string");
      expect(typeof chip.text).toBe("string");
    });
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

describe("validateChatMessage", () => {
  it("rejects empty or whitespace-only messages", () => {
    expect(validateChatMessage("")).toEqual({
      isValid: false,
      cleanText: "",
      error: "El mensaje no puede estar vacío",
    });
    expect(validateChatMessage("   ")).toEqual({
      isValid: false,
      cleanText: "",
      error: "El mensaje no puede estar vacío",
    });
  });

  it("rejects messages longer than 300 characters", () => {
    const longText = "a".repeat(301);
    const res = validateChatMessage(longText);
    expect(res.isValid).toBe(false);
    expect(res.error).toBe("El mensaje es demasiado largo (máximo 300 caracteres)");
  });

  it("accepts valid chat messages and returns trimmed text", () => {
    const res = validateChatMessage("  Llego 5 minutos tarde  ");
    expect(res).toEqual({
      isValid: true,
      cleanText: "Llego 5 minutos tarde",
    });
  });
});

describe("getChatMessageAriaLabel", () => {
  const baseDate = new Date("2026-08-12T15:30:00");
  const tsToday = Math.floor(new Date("2026-08-12T12:15:00").getTime() / 1000);

  it("formats system message ARIA labels accurately", () => {
    const label = getChatMessageAriaLabel(
      {
        userId: "system-bot",
        alias: "Sistema",
        type: "system",
        text: "✅ Turno completo",
        ts: tsToday,
      },
      "user-1",
      baseDate,
    );
    expect(label).toBe("Aviso del sistema (12:15): ✅ Turno completo");
  });

  it("formats current user chat message ARIA labels accurately", () => {
    const label = getChatMessageAriaLabel(
      {
        userId: "user-1",
        alias: "Bela",
        type: "user",
        text: "Llevo tubo de pelotas",
        ts: tsToday,
      },
      "user-1",
      baseDate,
    );
    expect(label).toBe("Mensaje de Vos (12:15): Llevo tubo de pelotas");
  });

  it("formats other participant chat message ARIA labels accurately", () => {
    const label = getChatMessageAriaLabel(
      {
        userId: "user-2",
        alias: "Gero",
        type: "user",
        text: "Nos vemos ahí",
        ts: tsToday,
      },
      "user-1",
      baseDate,
    );
    expect(label).toBe("Mensaje de Gero (12:15): Nos vemos ahí");
  });
});

describe("getQuickChipAriaLabel & Landmark Helpers", () => {
  it("returns accessible quick chip label", () => {
    expect(getQuickChipAriaLabel("Llego 10 min tarde")).toBe("Usar atajo: Llego 10 min tarde");
  });

  it("returns accessible region landmark label", () => {
    expect(getChatRegionAriaLabel()).toBe("Chat de coordinación del turno de pádel");
  });

  it("formats chat log status message correctly", () => {
    expect(getChatLogAriaLabel(0)).toBe("Historial del chat del turno, sin mensajes");
    expect(getChatLogAriaLabel(1)).toBe("Historial del chat del turno, 1 mensaje");
    expect(getChatLogAriaLabel(5)).toBe("Historial del chat del turno, 5 mensajes");
  });

  it("formats chat input and character counter labels correctly", () => {
    expect(getChatInputAriaLabel(false)).toBe("Escribir mensaje para el chat del turno");
    expect(getChatInputAriaLabel(true)).toBe("Enviando mensaje...");
    expect(getChatCharacterCounterAriaLabel(210, 300)).toBe("210 de 300 caracteres (90 restantes)");
  });
});
