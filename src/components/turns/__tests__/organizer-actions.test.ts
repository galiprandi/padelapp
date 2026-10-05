import { describe, it, expect } from "vitest";
import {
  getOpenSlotsBadgeText,
  getTurnUrgencyBadgeText,
  getTurnSalvageShareMessage,
  getRemovePlayerAriaLabel,
  getRemovePlayerCancelAriaLabel,
  getRemovePlayerRegionAriaLabel,
  getRemovePlayerSuccessToast,
  getRemovePlayerErrorToast,
  getRemovePlayerConfirmText,
  getAssignSubstituteAriaLabel,
  getAssignSubstituteRegionAriaLabel,
  getAssignSubstituteSuccessToast,
  getAssignSubstituteErrorToast,
  getAssignSubstituteButtonText,
} from "../turn-utils";

describe("Turn Utils & Organizer Helpers", () => {
  it("formats remove player ARIA label, cancel label, region label and toast", () => {
    expect(getRemovePlayerAriaLabel({ playerName: "Lucas" })).toBe("Sacar a Lucas del turno");
    expect(getRemovePlayerAriaLabel({ playerName: "Lucas", isConfirming: true })).toBe("Confirmar sacar a Lucas del turno");
    expect(getRemovePlayerAriaLabel({ playerName: "Lucas", isPending: true })).toBe("Sacando a Lucas...");
    expect(getRemovePlayerCancelAriaLabel("Lucas")).toBe("Cancelar sacar a Lucas del turno");
    expect(getRemovePlayerCancelAriaLabel()).toBe("Cancelar sacar jugador");
    expect(getRemovePlayerRegionAriaLabel({ playerName: "Lucas", isConfirming: false })).toBe("Gestión de jugador Lucas");
    expect(getRemovePlayerRegionAriaLabel({ playerName: "Lucas", isConfirming: true })).toBe("Confirmación para sacar a Lucas");
    expect(getRemovePlayerSuccessToast("Lucas")).toBe("Sacaste a Lucas del turno.");
    expect(getRemovePlayerErrorToast("Error al remover")).toBe("Error al remover");
    expect(getRemovePlayerErrorToast()).toBe("No se pudo sacar al jugador.");
    expect(getRemovePlayerConfirmText()).toBe("Sacar");
  });

  it("formats assign substitute ARIA label, region label, button text and toast", () => {
    expect(getAssignSubstituteAriaLabel({ substituteName: "Marcos" })).toBe("Asignar a Marcos como titular");
    expect(getAssignSubstituteAriaLabel({ substituteName: "Marcos", isPending: true })).toBe("Asignando a Marcos...");
    expect(getAssignSubstituteRegionAriaLabel("Marcos")).toBe("Asignación de suplente Marcos");
    expect(getAssignSubstituteSuccessToast("Marcos")).toBe("Promoviste a Marcos a titular.");
    expect(getAssignSubstituteErrorToast("Error al asignar")).toBe("Error al asignar");
    expect(getAssignSubstituteErrorToast()).toBe("No se pudo asignar al suplente.");
    expect(getAssignSubstituteButtonText(false)).toBe("Asignar");
    expect(getAssignSubstituteButtonText(true)).toBe("Asignando...");
  });
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
