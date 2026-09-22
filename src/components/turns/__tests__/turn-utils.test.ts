import { describe, it, expect } from "vitest";
import {
  formatWhatsAppInviteMessage,
  formatWhatsAppGroupInviteMessage,
  getWhatsAppInviteUrl,
  getWhatsAppGroupInviteUrl,
  getTurnSalvageShareMessage,
  getOpenSlotsBadgeText,
  getTurnSalvageBannerText,
  getTurnRoleBadgeText,
  getCooldownRemainingMinutes,
  getTurnUrgencyBadgeText,
  getNextRadioValue,
  filterTurnsByTab,
  formatSpanishNamesList,
  formatContactPlayersSummary,
  getTurnPublicSubtitle,
  isLateLeaveWarningRequired,
  filterAndSortPlayerOptions,
  getAddPlayerSuccessToast,
  getAddPlayerAriaLabel,
  getAddPlayerSearchStatusAriaLabel,
  getAddPlayerPromptText,
  getAddPlayerEmptyResultsText,
  getAddPlayerClearSearchAriaLabel,
  getAddPlayerCancelSearchAriaLabel,
  validateTurnFormData,
  getNewTurnWhatsAppShareUrl,
  formatTurnSalvageCalloutAriaLabel,
  formatTurnProgressPercentage,
  formatTurnProgressAriaLabel,
  formatSubstituteListAriaLabel,
  buildTurnConnectionMap,
  formatCalendarUTC,
  getGoogleCalendarUrl,
  getCancelTurnAriaLabel,
  getCancelTurnConfirmRegionAriaLabel,
  getStartMatchAriaLabel,
  getJoinTurnAriaLabel,
  getJoinSubstituteAriaLabel,
  getLeaveSubstituteAriaLabel,
  getTakeOpenSlotAriaLabel,
  getScheduleNextTurnAriaLabel,
  getPlayCasualAriaLabel,
  getPlayCasualConfirmRegionAriaLabel,
  getIcsCalendarContent,
  getCalendarOptionsAriaLabel,
  getRemovePlayerAriaLabel,
  getRemovePlayerSuccessToast,
  getAssignSubstituteAriaLabel,
  getAssignSubstituteSuccessToast,
  getTurnFilterAriaLabel,
  formatTurnFilterBadgeText,
  getTurnFilterTabAriaLabel,
  getTurnCardAriaLabel,
  getQuickJoinAriaLabel,
  getTurnStatusBadgeAriaLabel,
  getLeaveTurnSuccessToast,
  getLeaveTurnErrorToast,
  getLeaveTurnTriggerAriaLabel,
  getLeaveTurnRegionAriaLabel,
  getCancelLeaveTurnAriaLabel,
  getConfirmLeaveTurnAriaLabel,
  getOpenToNetworkSuccessToast,
  getOpenToNetworkErrorToast,
  getOpenToNetworkRegionAriaLabel,
  getOpenToNetworkResultText,
  getOpenToNetworkAriaLabel,
  getWhatsAppInviteSuccessToast,
  getWhatsAppGroupInviteSuccessToast,
  getWhatsAppInviteAriaLabel,
  getWhatsAppGroupInviteAriaLabel,
  getContactBadgeText,
  getSuggestedContactSectionAriaLabel,
  getTurnActionsRegionAriaLabel,
  getSubstituteWaitlistMessage,
  getSubstituteNoSlotsText,
  getTurnCompletedButtonLabel,
  getAlreadyJoinedButtonLabel,
  getSignInPromptText,
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

  it("formats invite message correctly for today date", () => {
    const todayDate = new Date();
    todayDate.setHours(18, 0, 0, 0);

    const msg = formatWhatsAppInviteMessage({
      club: "Padel Club",
      date: todayDate,
      contactName: "Santi",
      openSlots: 1,
      shareUrl: "https://padelred.app/t/789",
    });

    expect(msg).toContain("hoy 18hs");
  });

  it("formats invite message correctly for tomorrow date", () => {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    tomorrowDate.setHours(19, 30, 0, 0);

    const msg = formatWhatsAppInviteMessage({
      club: "Padel Club",
      date: tomorrowDate,
      contactName: "Lucas",
      openSlots: 1,
      shareUrl: "https://padelred.app/t/789",
    });

    expect(msg).toContain("mañana 19:30hs");
  });
});

describe("formatWhatsAppGroupInviteMessage", () => {
  it("formats WhatsApp group invite for 1 missing slot", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(19, 0, 0, 0);

    const msg = formatWhatsAppGroupInviteMessage({
      club: "Central Padel",
      date: futureDate,
      openSlots: 1,
      shareUrl: "https://padelred.app/t/group123",
    });

    expect(msg).toContain("⚠️ Falta 1 jugador para el turno de pádel en Central Padel");
    expect(msg).toContain("¿Quién se suma? Entren acá para anotarse: https://padelred.app/t/group123");
    expect(msg).not.toContain("!");
    expect(msg).not.toContain("¡");
  });

  it("formats WhatsApp group invite for multiple missing slots", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(21, 0, 0, 0);

    const msg = formatWhatsAppGroupInviteMessage({
      club: "Padel Park",
      date: futureDate,
      openSlots: 2,
      shareUrl: "https://padelred.app/t/group456",
    });

    expect(msg).toContain("⚠️ Faltan 2 jugadores para el turno de pádel en Padel Park");
    expect(msg).toContain("¿Quién se suma? Entren acá para anotarse: https://padelred.app/t/group456");
  });
});

describe("getWhatsAppInviteUrl and getWhatsAppGroupInviteUrl", () => {
  it("generates wa.me URL with encoded individual invite message", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(19, 0, 0, 0);

    const url = getWhatsAppInviteUrl({
      club: "Central Padel",
      date: futureDate,
      contactName: "Mateo",
      openSlots: 1,
      shareUrl: "https://padelred.app/t/123",
    });

    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(url).toContain(encodeURIComponent("Hola Mateo"));
    expect(url).toContain(encodeURIComponent("Central Padel"));
  });

  it("generates wa.me URL with encoded group salvage invite message", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(20, 0, 0, 0);

    const url = getWhatsAppGroupInviteUrl({
      club: "Padel Park",
      date: futureDate,
      openSlots: 2,
      shareUrl: "https://padelred.app/t/group456",
    });

    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(url).toContain(encodeURIComponent("⚠️ Faltan 2 jugadores"));
    expect(url).toContain(encodeURIComponent("Padel Park"));
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

describe("getNextRadioValue", () => {
  const options = ["60", "90", "120"] as const;

  it("navigates forward with ArrowRight and ArrowDown with wrap-around", () => {
    expect(getNextRadioValue(options, "60", "ArrowRight")).toBe("90");
    expect(getNextRadioValue(options, "90", "ArrowDown")).toBe("120");
    expect(getNextRadioValue(options, "120", "ArrowRight")).toBe("60");
  });

  it("navigates backward with ArrowLeft and ArrowUp with wrap-around", () => {
    expect(getNextRadioValue(options, "120", "ArrowLeft")).toBe("90");
    expect(getNextRadioValue(options, "90", "ArrowUp")).toBe("60");
    expect(getNextRadioValue(options, "60", "ArrowLeft")).toBe("120");
  });

  it("returns null for unsupported keys", () => {
    expect(getNextRadioValue(options, "60", "Enter")).toBeNull();
    expect(getNextRadioValue(options, "60", "Tab")).toBeNull();
  });

  it("handles empty options or invalid current value safely", () => {
    expect(getNextRadioValue([], "60", "ArrowRight")).toBeNull();
    expect(getNextRadioValue(options, "invalid" as string, "ArrowRight")).toBe("60");
  });
});

describe("filterTurnsByTab", () => {
  const turns = [
    {
      id: "t1",
      creatorId: "u1",
      players: [{ userId: "u1" }, { userId: "u2" }],
      substitutes: [],
    },
    {
      id: "t2",
      creatorId: "u3",
      players: [{ userId: "u3" }, { userId: "u1" }],
      substitutes: [],
    },
    {
      id: "t3",
      creatorId: "u4",
      players: [{ userId: "u4" }, { userId: "u5" }],
      substitutes: [{ userId: "u1" }],
    },
    {
      id: "t4",
      creatorId: "u6",
      players: [{ userId: "u6" }, { userId: "u7" }],
      substitutes: [],
    },
  ];

  it("returns all turns when activeTab is 'todos'", () => {
    expect(filterTurnsByTab(turns, "todos", "u1")).toHaveLength(4);
    expect(filterTurnsByTab(turns, "todos", null)).toHaveLength(4);
  });

  it("returns empty array when activeTab is 'mis-turnos' and userId is null", () => {
    expect(filterTurnsByTab(turns, "mis-turnos", null)).toEqual([]);
  });

  it("filters turns where user is creator, player, or substitute when activeTab is 'mis-turnos'", () => {
    const myTurns = filterTurnsByTab(turns, "mis-turnos", "u1");
    expect(myTurns.map((t) => t.id)).toEqual(["t1", "t2", "t3"]);
  });

  it("excludes turns where user has no role when activeTab is 'mis-turnos'", () => {
    const myTurns = filterTurnsByTab(turns, "mis-turnos", "u2");
    expect(myTurns.map((t) => t.id)).toEqual(["t1"]);
  });
});

describe("formatSpanishNamesList", () => {
  it("returns empty string for empty array", () => {
    expect(formatSpanishNamesList([])).toBe("");
  });

  it("returns single name for 1 name", () => {
    expect(formatSpanishNamesList(["Mateo"])).toBe("Mateo");
  });

  it("formats two names with 'y'", () => {
    expect(formatSpanishNamesList(["Mateo", "Santi"])).toBe("Mateo y Santi");
  });

  it("formats three or more names with commas and 'y'", () => {
    expect(formatSpanishNamesList(["Mateo", "Santi", "Lucas"])).toBe("Mateo, Santi y Lucas");
    expect(formatSpanishNamesList(["A", "B", "C", "D"])).toBe("A, B, C y D");
  });
});

describe("formatContactPlayersSummary", () => {
  it("returns empty string for empty names", () => {
    expect(formatContactPlayersSummary([])).toBe("");
  });

  it("formats singular contact player summary", () => {
    expect(formatContactPlayersSummary(["Gonzalo"])).toBe("Juega tu contacto: Gonzalo");
  });

  it("formats plural contact players summary", () => {
    expect(formatContactPlayersSummary(["Gonzalo", "Martín"])).toBe("Juegan tus contactos: Gonzalo y Martín");
  });
});

describe("getTurnPublicSubtitle", () => {
  const compactDate = "sáb, 25 jul · 19:00hs";

  it("formats subtitle for unauthenticated viewer", () => {
    const sub = getTurnPublicSubtitle({
      viewerId: null,
      creatorName: "Facundo",
      compactDate,
    });
    expect(sub).toBe(`Te invita Facundo · ${compactDate}`);
  });

  it("formats subtitle for substitute viewer", () => {
    const sub = getTurnPublicSubtitle({
      viewerId: "usr123",
      creatorName: "Facundo",
      compactDate,
      isSubstitute: true,
      substituteIndex: 0,
      substitutesCount: 2,
    });
    expect(sub).toBe("Suplente #1 de 2");
  });

  it("formats subtitle for joined viewer in completed vs active turn", () => {
    const activeSub = getTurnPublicSubtitle({
      viewerId: "usr123",
      creatorName: "Facundo",
      compactDate,
      isJoined: true,
      isCompleted: false,
    });
    expect(activeSub).toBe(`Ya te sumaste · ${compactDate}`);

    const completedSub = getTurnPublicSubtitle({
      viewerId: "usr123",
      creatorName: "Facundo",
      compactDate,
      isJoined: true,
      isCompleted: true,
    });
    expect(completedSub).toBe("Turno finalizado");
  });

  it("formats subtitle for full turn for non-joined viewer", () => {
    const fullSub1 = getTurnPublicSubtitle({
      viewerId: "usr123",
      creatorName: "Facundo",
      compactDate,
      isFull: true,
      substitutesCount: 1,
    });
    expect(fullSub1).toBe("Turno completo · 1 suplente");

    const fullSub2 = getTurnPublicSubtitle({
      viewerId: "usr123",
      creatorName: "Facundo",
      compactDate,
      isFull: true,
      substitutesCount: 3,
    });
    expect(fullSub2).toBe("Turno completo · 3 suplentes");
  });

  it("formats default open turn subtitle for authenticated viewer", () => {
    const sub = getTurnPublicSubtitle({
      viewerId: "usr123",
      creatorName: "Facundo",
      compactDate,
    });
    expect(sub).toBe(`Sumate a este turno · ${compactDate}`);
  });
});

describe("isLateLeaveWarningRequired", () => {
  const baseTime = new Date("2026-09-05T12:00:00Z").getTime();

  it("returns true when turn is in 1.5 hours and user is not creator", () => {
    const turnDate = new Date("2026-09-05T13:30:00Z");
    expect(
      isLateLeaveWarningRequired({
        date: turnDate,
        isCreator: false,
        nowMs: baseTime,
      })
    ).toBe(true);
  });

  it("returns false when turn is in 3 hours", () => {
    const turnDate = new Date("2026-09-05T15:00:00Z");
    expect(
      isLateLeaveWarningRequired({
        date: turnDate,
        isCreator: false,
        nowMs: baseTime,
      })
    ).toBe(false);
  });

  it("returns false when user is turn creator", () => {
    const turnDate = new Date("2026-09-05T13:30:00Z");
    expect(
      isLateLeaveWarningRequired({
        date: turnDate,
        isCreator: true,
        nowMs: baseTime,
      })
    ).toBe(false);
  });

  it("returns false for past turn dates", () => {
    const turnDate = new Date("2026-09-05T11:00:00Z");
    expect(
      isLateLeaveWarningRequired({
        date: turnDate,
        isCreator: false,
        nowMs: baseTime,
      })
    ).toBe(false);
  });
});

describe("filterAndSortPlayerOptions", () => {
  const players = [
    { id: "p1", displayName: "Mateo", isContact: false },
    { id: "p2", displayName: "Agustín", isContact: true },
    { id: "p3", displayName: "Santiago", isContact: false },
    { id: "p4", displayName: "Lucas", isContact: true },
  ];

  it("filters out players already in existingPlayerIds", () => {
    const existing = ["p1", "p3"];
    const result = filterAndSortPlayerOptions(players, existing);
    expect(result.map((p) => p.id)).not.toContain("p1");
    expect(result.map((p) => p.id)).not.toContain("p3");
    expect(result.map((p) => p.id)).toEqual(["p2", "p4"]);
  });

  it("sorts contacts to top of results", () => {
    const existing: string[] = [];
    const result = filterAndSortPlayerOptions(players, existing);
    // p2 and p4 (contacts) should be at index 0 and 1
    expect(result[0].isContact).toBe(true);
    expect(result[1].isContact).toBe(true);
    expect(result[2].isContact).toBe(false);
    expect(result[3].isContact).toBe(false);
  });
});

describe("getAddPlayerSuccessToast and getAddPlayerAriaLabel", () => {
  it("formats success toast message in Argentine Spanish", () => {
    expect(getAddPlayerSuccessToast("Mateo")).toBe("Agregaste a Mateo al turno.");
  });

  it("formats ARIA label for adding player", () => {
    expect(getAddPlayerAriaLabel("Mateo")).toBe("Agregar a Mateo al turno");
  });

  it("formats getAddPlayerSearchStatusAriaLabel across search states", () => {
    expect(getAddPlayerSearchStatusAriaLabel({ isSearching: true })).toBe(
      "Buscando jugadores por nombre o email..."
    );
    expect(getAddPlayerSearchStatusAriaLabel({ query: "a" })).toBe(
      "Escribí al menos 2 caracteres para buscar jugadores."
    );
    expect(getAddPlayerSearchStatusAriaLabel({ query: "jo", count: 0 })).toBe(
      "No se encontraron jugadores con ese nombre o email."
    );
    expect(getAddPlayerSearchStatusAriaLabel({ query: "jo", count: 1 })).toBe(
      "Se encontraron 1 jugador."
    );
    expect(getAddPlayerSearchStatusAriaLabel({ query: "jo", count: 3 })).toBe(
      "Se encontraron 3 jugadores."
    );
  });

  it("formats prompt, empty result, and button ARIA labels for add player", () => {
    expect(getAddPlayerPromptText()).toBe("Escribí al menos 2 caracteres para buscar.");
    expect(getAddPlayerEmptyResultsText()).toBe("No se encontraron jugadores con ese nombre.");
    expect(getAddPlayerClearSearchAriaLabel()).toBe("Limpiar búsqueda de jugador");
    expect(getAddPlayerCancelSearchAriaLabel()).toBe("Cancelar búsqueda de jugador");
  });
});

describe("validateTurnFormData", () => {
  const nowMs = new Date("2026-09-10T12:00:00Z").getTime();

  it("returns error when club, date, or time is empty", () => {
    expect(
      validateTurnFormData({ club: "", date: "2026-09-10", time: "18:00" }, nowMs)
    ).toEqual({ valid: false, error: "Completá club, fecha y hora" });

    expect(
      validateTurnFormData({ club: "  ", date: "2026-09-10", time: "18:00" }, nowMs)
    ).toEqual({ valid: false, error: "Completá club, fecha y hora" });

    expect(
      validateTurnFormData({ club: "Club Padel", date: "", time: "18:00" }, nowMs)
    ).toEqual({ valid: false, error: "Completá club, fecha y hora" });

    expect(
      validateTurnFormData({ club: "Club Padel", date: "2026-09-10", time: "" }, nowMs)
    ).toEqual({ valid: false, error: "Completá club, fecha y hora" });
  });

  it("returns error when combined datetime is in the past", () => {
    const result = validateTurnFormData(
      { club: "Central Padel", date: "2026-09-10", time: "10:00" },
      nowMs
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("pasado");
  });

  it("returns valid true and combinedDate when datetime is in the future", () => {
    const result = validateTurnFormData(
      { club: "Central Padel", date: "2026-09-10", time: "19:00" },
      nowMs
    );
    expect(result.valid).toBe(true);
    expect(result.combinedDate).toBeInstanceOf(Date);
  });
});

describe("getNewTurnWhatsAppShareUrl", () => {
  it("formats WhatsApp share URL with natural share text and turn URL", () => {
    const date = new Date("2026-09-15T19:00:00Z");
    const url = getNewTurnWhatsAppShareUrl({
      club: "Central Padel",
      date,
      turnId: "t123",
      origin: "https://padelred.app",
    });

    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    expect(url).toContain(encodeURIComponent("Central Padel"));
    expect(url).toContain(encodeURIComponent("https://padelred.app/t/t123"));
  });
});

describe("formatTurnSalvageCalloutAriaLabel", () => {
  it("returns empty string when no slots are open", () => {
    expect(formatTurnSalvageCalloutAriaLabel({ club: "Central Padel", openSlots: 0 })).toBe("");
    expect(formatTurnSalvageCalloutAriaLabel({ club: "Central Padel", openSlots: -1 })).toBe("");
  });

  it("formats callout ARIA label for 1 open slot", () => {
    const label = formatTurnSalvageCalloutAriaLabel({ club: "Central Padel", openSlots: 1 });
    expect(label).toBe("Aviso de salvataje: Falta 1 jugador para completar este turno en Central Padel.");
  });

  it("formats callout ARIA label for multiple open slots", () => {
    const label = formatTurnSalvageCalloutAriaLabel({ club: "El Balcón", openSlots: 2 });
    expect(label).toBe("Aviso de salvataje: Faltan 2 jugadores para completar este turno en El Balcón.");
  });
});

describe("formatTurnProgressPercentage and formatTurnProgressAriaLabel", () => {
  it("calculates progress percentage correctly bounded between 0 and 100", () => {
    expect(formatTurnProgressPercentage(0, 4)).toBe(0);
    expect(formatTurnProgressPercentage(2, 4)).toBe(50);
    expect(formatTurnProgressPercentage(3, 4)).toBe(75);
    expect(formatTurnProgressPercentage(4, 4)).toBe(100);
    expect(formatTurnProgressPercentage(5, 4)).toBe(100);
    expect(formatTurnProgressPercentage(0, 0)).toBe(0);
  });

  it("formats enrollment progress bar ARIA label", () => {
    expect(formatTurnProgressAriaLabel(3, 4)).toBe(
      "Progreso de inscripción: 3 de 4 jugadores (75% completado)"
    );
    expect(formatTurnProgressAriaLabel(4, 4)).toBe(
      "Progreso de inscripción: 4 de 4 jugadores (100% completado)"
    );
  });
});

describe("TurnActions Region and Copy Helpers", () => {
  it("formats getTurnActionsRegionAriaLabel across user authentication, role, and turn status states", () => {
    expect(
      getTurnActionsRegionAriaLabel({ club: "Central Padel", viewerId: undefined })
    ).toBe("Acciones del turno en Central Padel: Iniciar sesión o compartir enlace");

    expect(
      getTurnActionsRegionAriaLabel({ club: "Central Padel", viewerId: "u1", isCompleted: true })
    ).toBe("Acciones del turno en Central Padel: Turno finalizado");

    expect(
      getTurnActionsRegionAriaLabel({
        club: "Central Padel",
        viewerId: "u1",
        isSubstitute: true,
        openSlots: 1,
      })
    ).toBe("Acciones del turno en Central Padel: Ocupar cupo disponible o salir de suplentes");

    expect(
      getTurnActionsRegionAriaLabel({
        club: "Central Padel",
        viewerId: "u1",
        isSubstitute: true,
        openSlots: 0,
      })
    ).toBe("Acciones del turno en Central Padel: Lista de espera de suplentes");

    expect(
      getTurnActionsRegionAriaLabel({
        club: "Central Padel",
        viewerId: "u1",
        isCreator: true,
      })
    ).toBe("Acciones de organización del turno en Central Padel");

    expect(
      getTurnActionsRegionAriaLabel({
        club: "Central Padel",
        viewerId: "u1",
        isJoined: true,
      })
    ).toBe("Acciones del turno en Central Padel: Bajarme del turno o compartir");

    expect(
      getTurnActionsRegionAriaLabel({
        club: "Central Padel",
        viewerId: "u1",
        isFull: true,
      })
    ).toBe("Acciones del turno en Central Padel: Turno completo, sumarme como suplente");

    expect(
      getTurnActionsRegionAriaLabel({
        club: "Central Padel",
        viewerId: "u1",
        openSlots: 2,
      })
    ).toBe("Acciones del turno en Central Padel: Sumarme ahora o compartir");
  });

  it("formats copy helper strings accurately", () => {
    expect(getSubstituteWaitlistMessage()).toBe(
      "Estás en la lista de espera. Te avisaremos cuando se libere un cupo."
    );
    expect(getSubstituteNoSlotsText()).toBe("No hay cupos libres todavía");
    expect(getTurnCompletedButtonLabel()).toBe("Turno finalizado");
    expect(getAlreadyJoinedButtonLabel()).toBe("Ya te sumaste");
    expect(getSignInPromptText("Central Padel")).toBe("Iniciá sesión para sumarte a Central Padel");
  });
});

describe("getContactBadgeText and getSuggestedContactSectionAriaLabel", () => {
  it("formats contact badge text in Argentine Spanish", () => {
    expect(getContactBadgeText(false)).toBe("Contacto");
    expect(getContactBadgeText(true)).toBe("Contacto frecuente");
  });

  it("formats suggested contacts section ARIA label", () => {
    expect(
      getSuggestedContactSectionAriaLabel({ count: 1, openSlots: 1 })
    ).toBe(
      "Contactos sugeridos de tu red de pádel para invitar por WhatsApp: 1 contacto sugerido para cubrir 1 cupo disponible."
    );

    expect(
      getSuggestedContactSectionAriaLabel({ count: 3, openSlots: 2 })
    ).toBe(
      "Contactos sugeridos de tu red de pádel para invitar por WhatsApp: 3 contactos sugeridos para cubrir 2 cupos disponibles."
    );
  });
});

describe("WhatsApp Invite pure helpers", () => {
  it("formats getWhatsAppInviteSuccessToast and getWhatsAppGroupInviteSuccessToast in Argentine Spanish", () => {
    expect(getWhatsAppInviteSuccessToast("Mateo")).toBe("Abriste WhatsApp para invitar a Mateo.");
    expect(getWhatsAppGroupInviteSuccessToast()).toBe("Abriste WhatsApp para enviar la invitación al grupo.");
  });

  it("formats getWhatsAppInviteAriaLabel and getWhatsAppGroupInviteAriaLabel", () => {
    expect(getWhatsAppInviteAriaLabel("Mateo", "Central Padel")).toBe(
      "Invitar a Mateo por WhatsApp para sumar al turno en Central Padel"
    );
    expect(getWhatsAppGroupInviteAriaLabel(1, "Central Padel")).toBe(
      "Invitar a grupo de WhatsApp para sumar 1 jugador al turno en Central Padel"
    );
    expect(getWhatsAppGroupInviteAriaLabel(2, "Central Padel")).toBe(
      "Invitar a grupo de WhatsApp para sumar 2 jugadores al turno en Central Padel"
    );
  });

});

describe("LeaveTurnButton and OpenToNetworkButton pure helpers", () => {
  it("formats leave turn toast messages and ARIA labels", () => {
    expect(getLeaveTurnSuccessToast()).toBe("Te bajaste del turno.");
    expect(getLeaveTurnErrorToast()).toBe("No se pudo bajar del turno.");
    expect(getLeaveTurnErrorToast("Error personalizado")).toBe("Error personalizado");
    expect(getLeaveTurnTriggerAriaLabel()).toBe("Bajarme del turno");
    expect(getLeaveTurnRegionAriaLabel()).toBe("Baja del turno");
    expect(getCancelLeaveTurnAriaLabel()).toBe("Cancelar baja del turno");
    expect(getConfirmLeaveTurnAriaLabel({})).toBe("Confirmar baja del turno");
    expect(getConfirmLeaveTurnAriaLabel({ isPending: true })).toBe("Procesando baja del turno...");
  });

  it("formats open to network toast messages, result text, and ARIA labels", () => {
    expect(getOpenToNetworkSuccessToast(0)).toBe("Se avisó a tu red.");
    expect(getOpenToNetworkSuccessToast(1)).toBe("Se notificó a 1 contacto de tu red.");
    expect(getOpenToNetworkSuccessToast(3)).toBe("Se notificó a 3 contactos de tu red.");
    expect(getOpenToNetworkErrorToast()).toBe("No se pudo notificar a tu red.");
    expect(getOpenToNetworkErrorToast("Fallo de red")).toBe("Fallo de red");
    expect(getOpenToNetworkRegionAriaLabel()).toBe("Notificación a red de contactos");
    expect(getOpenToNetworkResultText(0)).toBe("Red notificada");
    expect(getOpenToNetworkResultText(1)).toBe("Se notificó a 1 contacto");
    expect(getOpenToNetworkResultText(2)).toBe("Se notificó a 2 contactos");

    expect(getOpenToNetworkAriaLabel({})).toBe("Abrir a mi red");
    expect(getOpenToNetworkAriaLabel({ label: "Notificar red" })).toBe("Notificar red");
    expect(getOpenToNetworkAriaLabel({ isPending: true })).toBe("Notificando a tu red de pádel...");
    expect(getOpenToNetworkAriaLabel({ isOnCooldown: true, minutesRemaining: 1 })).toBe("Notificado, en cooldown por 1 minuto");
    expect(getOpenToNetworkAriaLabel({ isOnCooldown: true, minutesRemaining: 15 })).toBe("Notificado, en cooldown por 15 minutos");
  });
});

describe("TurnActions ARIA label helpers", () => {
  it("getCancelTurnAriaLabel", () => {
    expect(getCancelTurnAriaLabel({})).toBe("Cancelar y eliminar este turno");
    expect(getCancelTurnAriaLabel({ isConfirming: true })).toBe(
      "Confirmar eliminación del turno"
    );
    expect(getCancelTurnAriaLabel({ isPending: true })).toBe(
      "Eliminando el turno..."
    );
  });

  it("getCancelTurnConfirmRegionAriaLabel", () => {
    expect(getCancelTurnConfirmRegionAriaLabel()).toBe(
      "Confirmación para cancelar y eliminar el turno"
    );
  });

  it("getStartMatchAriaLabel", () => {
    expect(getStartMatchAriaLabel({})).toBe("Iniciar partido ahora");
    expect(getStartMatchAriaLabel({ isPending: true })).toBe(
      "Iniciando partido..."
    );
  });

  it("getJoinTurnAriaLabel", () => {
    expect(getJoinTurnAriaLabel({})).toBe("Sumarme al turno");
    expect(getJoinTurnAriaLabel({ isPending: true })).toBe(
      "Sumándome al turno..."
    );
  });

  it("getJoinSubstituteAriaLabel", () => {
    expect(getJoinSubstituteAriaLabel({})).toBe("Sumarse como suplente");
    expect(getJoinSubstituteAriaLabel({ isPending: true })).toBe(
      "Sumándome como suplente..."
    );
  });

  it("getLeaveSubstituteAriaLabel", () => {
    expect(getLeaveSubstituteAriaLabel({})).toBe("Salir de la lista de suplentes");
    expect(getLeaveSubstituteAriaLabel({ isPending: true })).toBe(
      "Saliendo de la lista de suplentes..."
    );
  });

  it("getTakeOpenSlotAriaLabel", () => {
    expect(getTakeOpenSlotAriaLabel({})).toBe("Ocupar el cupo libre disponible");
    expect(getTakeOpenSlotAriaLabel({ isPending: true })).toBe(
      "Ocupando cupo disponible..."
    );
  });

  it("getScheduleNextTurnAriaLabel", () => {
    expect(getScheduleNextTurnAriaLabel({})).toBe(
      "Programar el próximo turno para la siguiente semana"
    );
    expect(getScheduleNextTurnAriaLabel({ isPending: true })).toBe(
      "Programando próximo turno..."
    );
  });

  it("getPlayCasualAriaLabel", () => {
    expect(getPlayCasualAriaLabel({})).toBe(
      "Marcar turno como jugado sin registrar partido"
    );
    expect(getPlayCasualAriaLabel({ isConfirming: true })).toBe(
      "Confirmar marcar como jugado"
    );
    expect(getPlayCasualAriaLabel({ isPending: true })).toBe(
      "Marcando turno como jugado..."
    );
  });

  it("getPlayCasualConfirmRegionAriaLabel", () => {
    expect(getPlayCasualConfirmRegionAriaLabel()).toBe(
      "Confirmación para marcar el turno como jugado sin registrar partido"
    );
  });
});

describe("TurnCard Accessibility Helpers", () => {
  it("formats getTurnCardAriaLabel across different user states and slot counts", () => {
    expect(
      getTurnCardAriaLabel({
        club: "Central Padel",
        enrolledCount: 3,
        maxPlayers: 4,
        isCreator: true,
      })
    ).toBe("Tarjeta de turno en Central Padel: 3 de 4 inscriptos (Organizador).");

    expect(
      getTurnCardAriaLabel({
        club: "Central Padel",
        enrolledCount: 3,
        maxPlayers: 4,
        isSubstitute: true,
      })
    ).toBe("Tarjeta de turno en Central Padel: 3 de 4 inscriptos (Suplente).");

    expect(
      getTurnCardAriaLabel({
        club: "Central Padel",
        enrolledCount: 3,
        maxPlayers: 4,
        isJoined: true,
      })
    ).toBe("Tarjeta de turno en Central Padel: 3 de 4 inscriptos (Inscripto).");

    expect(
      getTurnCardAriaLabel({
        club: "Central Padel",
        enrolledCount: 4,
        maxPlayers: 4,
      })
    ).toBe("Tarjeta de turno en Central Padel: 4 de 4 inscriptos (Completo).");

    expect(
      getTurnCardAriaLabel({
        club: "Central Padel",
        enrolledCount: 3,
        maxPlayers: 4,
      })
    ).toBe("Tarjeta de turno en Central Padel: 3 de 4 inscriptos (Falta 1 jugador).");

    expect(
      getTurnCardAriaLabel({
        club: "Central Padel",
        enrolledCount: 2,
        maxPlayers: 4,
      })
    ).toBe("Tarjeta de turno en Central Padel: 2 de 4 inscriptos (Faltan 2 jugadores).");
  });

  it("formats getQuickJoinAriaLabel for primary and substitute slots in idle and pending states", () => {
    expect(
      getQuickJoinAriaLabel({ club: "Central Padel", isSubstitute: false, isPending: false })
    ).toBe("Sumarse al turno en Central Padel");

    expect(
      getQuickJoinAriaLabel({ club: "Central Padel", isSubstitute: true, isPending: false })
    ).toBe("Sumarse como suplente al turno en Central Padel");

    expect(
      getQuickJoinAriaLabel({ club: "Central Padel", isSubstitute: false, isPending: true })
    ).toBe("Sumándome al turno...");

    expect(
      getQuickJoinAriaLabel({ club: "Central Padel", isSubstitute: true, isPending: true })
    ).toBe("Sumándome como suplente...");
  });

  it("formats getTurnStatusBadgeAriaLabel across roles and open slot counts", () => {
    expect(
      getTurnStatusBadgeAriaLabel({ openSlots: 1, isCreator: true })
    ).toBe("Rol: Organizador del turno");

    expect(
      getTurnStatusBadgeAriaLabel({ openSlots: 0, isSubstitute: true })
    ).toBe("Rol: Suplente en lista de espera");

    expect(
      getTurnStatusBadgeAriaLabel({ openSlots: 0, isJoined: true })
    ).toBe("Estado: Inscripto en el turno");

    expect(
      getTurnStatusBadgeAriaLabel({ openSlots: 0 })
    ).toBe("Estado: Turno completo");

    expect(
      getTurnStatusBadgeAriaLabel({ openSlots: 1 })
    ).toBe("Cupos disponibles: Falta 1 jugador");

    expect(
      getTurnStatusBadgeAriaLabel({ openSlots: 2 })
    ).toBe("Cupos disponibles: Faltan 2 jugadores");
  });
});

describe("Turn Filter Helpers", () => {
  it("formats getTurnFilterAriaLabel for 'todos' vs 'mis-turnos' tabs and counts", () => {
    expect(getTurnFilterAriaLabel({ activeTab: "todos", count: 1 })).toBe(
      "Sección de turnos abiertos de pádel: mostrando 1 turno."
    );
    expect(getTurnFilterAriaLabel({ activeTab: "todos", count: 3 })).toBe(
      "Sección de turnos abiertos de pádel: mostrando 3 turnos."
    );
    expect(getTurnFilterAriaLabel({ activeTab: "mis-turnos", count: 2 })).toBe(
      "Sección de tus partidos programados de pádel: mostrando 2 turnos."
    );
  });

  it("formats formatTurnFilterBadgeText in Argentine Spanish", () => {
    expect(formatTurnFilterBadgeText(1)).toBe("1 disponible");
    expect(formatTurnFilterBadgeText(4)).toBe("4 disponibles");
  });

  it("formats getTurnFilterTabAriaLabel for filter tab selection buttons", () => {
    expect(getTurnFilterTabAriaLabel({ tab: "todos", count: 5 })).toBe(
      "Mostrar todos los turnos disponibles (5)"
    );
    expect(getTurnFilterTabAriaLabel({ tab: "mis-turnos", count: 2 })).toBe(
      "Mostrar mis turnos únicamente (2)"
    );
  });
});

describe("Organizer Action Helpers", () => {
  it("formats getRemovePlayerAriaLabel across default, confirming, and pending states", () => {
    expect(getRemovePlayerAriaLabel({ playerName: "Mateo" })).toBe("Sacar a Mateo del turno");
    expect(getRemovePlayerAriaLabel({ playerName: "Mateo", isConfirming: true })).toBe("Confirmar sacar a Mateo del turno");
    expect(getRemovePlayerAriaLabel({ playerName: "Mateo", isPending: true })).toBe("Sacando a Mateo...");
  });

  it("formats getRemovePlayerSuccessToast in Argentine Spanish", () => {
    expect(getRemovePlayerSuccessToast("Mateo")).toBe("Sacaste a Mateo del turno.");
  });

  it("formats getAssignSubstituteAriaLabel across default and pending states", () => {
    expect(getAssignSubstituteAriaLabel({ substituteName: "Gonzalo" })).toBe("Asignar a Gonzalo como titular");
    expect(getAssignSubstituteAriaLabel({ substituteName: "Gonzalo", isPending: true })).toBe("Asignando a Gonzalo...");
  });

  it("formats getAssignSubstituteSuccessToast in Argentine Spanish", () => {
    expect(getAssignSubstituteSuccessToast("Gonzalo")).toBe("Promoviste a Gonzalo a titular.");
  });
});

describe("formatSubstituteListAriaLabel", () => {
  it("formats substitute list item ARIA label in Argentine Spanish", () => {
    expect(formatSubstituteListAriaLabel(0, 2, "Mateo")).toBe("Suplente #1 de 2: Mateo");
    expect(formatSubstituteListAriaLabel(1, 2, "Gonzalo")).toBe("Suplente #2 de 2: Gonzalo");
  });
});

describe("buildTurnConnectionMap", () => {
  const edge = { playerAId: "u1", playerBId: "u2" };

  it("maps a participant to the name of an earlier-joined contact", () => {
    const map = buildTurnConnectionMap(
      [
        { userId: "u1", joinedAt: new Date("2026-09-12T10:00:00Z"), name: "Ana" },
        { userId: "u2", joinedAt: new Date("2026-09-12T11:00:00Z"), name: "Beto" },
      ],
      [edge],
    );
    expect(map).toEqual({ u2: "Ana" });
  });

  // Regression test: the /t/[id] page crashed with
  // "joinedAt.getTime is not a function" because serialized cache payloads
  // deliver joinedAt as ISO strings, not Date instances.
  it("accepts ISO string joinedAt values without crashing", () => {
    const map = buildTurnConnectionMap(
      [
        { userId: "u1", joinedAt: "2026-09-12T10:00:00Z", name: "Ana" },
        { userId: "u2", joinedAt: "2026-09-12T11:00:00Z", name: "Beto" },
      ],
      [edge],
    );
    expect(map).toEqual({ u2: "Ana" });
  });

  it("matches edges in both directions", () => {
    const map = buildTurnConnectionMap(
      [
        { userId: "u1", joinedAt: new Date("2026-09-12T10:00:00Z"), name: "Ana" },
        { userId: "u2", joinedAt: new Date("2026-09-12T11:00:00Z"), name: "Beto" },
      ],
      [{ playerAId: "u2", playerBId: "u1" }],
    );
    expect(map).toEqual({ u2: "Ana" });
  });

  it("only connects a participant to someone who joined before them", () => {
    const map = buildTurnConnectionMap(
      [
        { userId: "u1", joinedAt: new Date("2026-09-12T12:00:00Z"), name: "Ana" },
        { userId: "u2", joinedAt: new Date("2026-09-12T10:00:00Z"), name: "Beto" },
      ],
      [edge],
    );
    expect(map).toEqual({ u1: "Beto" });
  });

  it("returns an empty map when no participant shares an edge", () => {
    const map = buildTurnConnectionMap(
      [
        { userId: "u1", joinedAt: new Date("2026-09-12T10:00:00Z"), name: "Ana" },
        { userId: "u3", joinedAt: new Date("2026-09-12T11:00:00Z"), name: "Caro" },
      ],
      [edge],
    );
    expect(map).toEqual({});
  });

  it("prefers the earliest connected participant when several edges match", () => {
    const map = buildTurnConnectionMap(
      [
        { userId: "u1", joinedAt: new Date("2026-09-12T10:00:00Z"), name: "Ana" },
        { userId: "u3", joinedAt: new Date("2026-09-12T10:30:00Z"), name: "Caro" },
        { userId: "u2", joinedAt: new Date("2026-09-12T11:00:00Z"), name: "Beto" },
      ],
      [edge, { playerAId: "u2", playerBId: "u3" }],
    );
    expect(map).toEqual({ u2: "Ana" });
  });
});

describe("formatCalendarUTC", () => {
  it("formats Date instance or valid ISO string into UTC YYYYMMDDTHHMMSSZ format", () => {
    const d = new Date("2026-09-20T18:30:00.000Z");
    expect(formatCalendarUTC(d)).toBe("20260920T183000Z");
    expect(formatCalendarUTC("2026-09-20T18:30:00.000Z")).toBe("20260920T183000Z");
  });

  it("returns empty string for invalid date values", () => {
    expect(formatCalendarUTC("invalid-date")).toBe("");
  });
});

describe("getGoogleCalendarUrl", () => {
  it("builds valid Google Calendar URL with encoded title, dates, details, and location", () => {
    const url = getGoogleCalendarUrl({
      turnId: "turn-123",
      club: "Central Padel",
      date: "2026-09-20T18:00:00.000Z",
      duration: 90,
      notes: "Traer tubo nuevo",
      origin: "https://padelred.app",
    });

    expect(url.startsWith("https://calendar.google.com/calendar/render?")).toBe(true);
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("text=");
    expect(url).toContain("Central+Padel");
    expect(url).toContain("dates=20260920T180000Z%2F20260920T193000Z");
    expect(url).toContain("location=Central+Padel");
    expect(url).toContain(encodeURIComponent("https://padelred.app/t/turn-123"));
    expect(url).toContain("Traer+tubo+nuevo");
  });

  it("returns empty string for invalid dates", () => {
    const url = getGoogleCalendarUrl({
      turnId: "turn-123",
      club: "Central Padel",
      date: "invalid-date",
      duration: 90,
    });
    expect(url).toBe("");
  });
});

describe("getIcsCalendarContent", () => {
  it("generates valid VCALENDAR lines with DTSTART, DTEND, SUMMARY, and LOCATION", () => {
    const now = new Date("2026-09-15T10:00:00.000Z");
    const ics = getIcsCalendarContent({
      turnId: "turn-456",
      club: "El Balcón",
      date: "2026-09-20T20:00:00.000Z",
      duration: 60,
      origin: "https://padelred.app",
      now,
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("UID:turn-turn-456@padelred.app");
    expect(ics).toContain("DTSTAMP:20260915T100000Z");
    expect(ics).toContain("DTSTART:20260920T200000Z");
    expect(ics).toContain("DTEND:20260920T210000Z");
    expect(ics).toContain("SUMMARY:Pádel · El Balcón · 20hs");
    expect(ics).toContain("LOCATION:El Balcón");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("returns empty string for invalid date values", () => {
    const ics = getIcsCalendarContent({
      turnId: "turn-456",
      club: "El Balcón",
      date: "invalid-date",
      duration: 60,
    });
    expect(ics).toBe("");
  });
});

describe("getCalendarOptionsAriaLabel", () => {
  it("formats accessible ARIA label for calendar options region", () => {
    expect(getCalendarOptionsAriaLabel("Central Padel")).toBe(
      "Opciones para agregar el partido en Central Padel a tu calendario"
    );
  });
});
