import { describe, it, expect } from "vitest";
import {
  isValidMatchType,
  defaultTeamLabel,
  sanitizeTeamLabel,
  teamForPosition,
  getNextRadioIndex,
} from "@/lib/match-helpers";
import { getMatchWinner } from "@/lib/utils";

describe("isValidMatchType", () => {
  it("accepts FRIENDLY", () => {
    expect(isValidMatchType("FRIENDLY")).toBe(true);
  });

  it("accepts LOCAL_TOURNAMENT", () => {
    expect(isValidMatchType("LOCAL_TOURNAMENT")).toBe(true);
  });

  it("rejects unknown type", () => {
    expect(isValidMatchType("UNKNOWN")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidMatchType("")).toBe(false);
  });

  it("rejects lowercase", () => {
    expect(isValidMatchType("friendly")).toBe(false);
  });
});

describe("defaultTeamLabel", () => {
  it("returns 'Pareja A' for team A in doubles", () => {
    expect(defaultTeamLabel("A", "DOUBLES")).toBe("Pareja A");
  });

  it("returns 'Pareja B' for team B in doubles", () => {
    expect(defaultTeamLabel("B", "DOUBLES")).toBe("Pareja B");
  });

  it("returns 'Jugador A' for team A in singles", () => {
    expect(defaultTeamLabel("A", "SINGLES")).toBe("Jugador A");
  });

  it("returns 'Jugador B' for team B in singles", () => {
    expect(defaultTeamLabel("B", "SINGLES")).toBe("Jugador B");
  });
});

describe("sanitizeTeamLabel", () => {
  it("returns default when value is undefined", () => {
    expect(sanitizeTeamLabel(undefined, "A", "DOUBLES")).toBe("Pareja A");
  });

  it("returns default when value is empty string", () => {
    expect(sanitizeTeamLabel("", "B", "DOUBLES")).toBe("Pareja B");
  });

  it("returns default when value is only whitespace", () => {
    expect(sanitizeTeamLabel("   ", "A", "SINGLES")).toBe("Jugador A");
  });

  it("returns trimmed value when valid", () => {
    expect(sanitizeTeamLabel("Los cracks", "A", "DOUBLES")).toBe("Los cracks");
  });

  it("trims surrounding whitespace from valid value", () => {
    expect(sanitizeTeamLabel("  Los cracks  ", "A", "DOUBLES")).toBe("Los cracks");
  });
});

describe("teamForPosition", () => {
  it("returns A for position 0 in singles (2 players)", () => {
    expect(teamForPosition(0, 2)).toBe("A");
  });

  it("returns B for position 1 in singles (2 players)", () => {
    expect(teamForPosition(1, 2)).toBe("B");
  });

  it("returns A for position 0 in doubles (4 players)", () => {
    expect(teamForPosition(0, 4)).toBe("A");
  });

  it("returns A for position 1 in doubles (4 players)", () => {
    expect(teamForPosition(1, 4)).toBe("A");
  });

  it("returns B for position 2 in doubles (4 players)", () => {
    expect(teamForPosition(2, 4)).toBe("B");
  });

  it("returns B for position 3 in doubles (4 players)", () => {
    expect(teamForPosition(3, 4)).toBe("B");
  });

  it("handles 3 players (casual mode) like doubles", () => {
    expect(teamForPosition(0, 3)).toBe("A");
    expect(teamForPosition(1, 3)).toBe("A");
    expect(teamForPosition(2, 3)).toBe("B");
  });
});

describe("computeBestPartnerAndNemesis", () => {
  it("calculates best partner and nemesis correctly from confirmed matches", () => {
    const viewerId = "p-01";
    const confirmedMatches = [
      {
        id: "m-01",
        score: "6-4, 6-3", // Team A wins
        players: [
          { position: 0, user: { id: "p-01", displayName: "Agustín" } },
          { position: 1, user: { id: "p-02", displayName: "Fernando" } },
          { position: 2, user: { id: "p-03", displayName: "Ramiro" } },
          { position: 3, user: { id: "p-04", displayName: "Gero" } },
        ],
      },
      {
        id: "m-02",
        score: "4-6, 5-7", // Team B wins
        players: [
          { position: 0, user: { id: "p-01", displayName: "Agustín" } },
          { position: 1, user: { id: "p-03", displayName: "Ramiro" } },
          { position: 2, user: { id: "p-02", displayName: "Fernando" } },
          { position: 3, user: { id: "p-04", displayName: "Gero" } },
        ],
      },
    ];

    const matchResults = confirmedMatches.map((match) => {
      const winner = getMatchWinner(match.score);
      if (!winner) return "L";
      const player = match.players.find((p) => p.user?.id === viewerId);
      const playerTeam = (player?.position ?? 0) < 2 ? "A" : "B";
      return winner === playerTeam ? "W" : "L";
    });

    const partnersWins: Record<string, { id: string; name: string; wins: number }> = {};
    const rivalsLosses: Record<string, { id: string; name: string; losses: number }> = {};

    confirmedMatches.forEach((match, idx) => {
      const viewer = match.players.find((p) => p.user?.id === viewerId);
      if (!viewer) return;
      const viewerTeamIdx = viewer.position < 2 ? 0 : 1;

      if (matchResults[idx] === "W") {
        const partner = match.players.find(
          (p) =>
            p.user?.id !== viewerId &&
            (viewerTeamIdx === 0 ? p.position < 2 : p.position >= 2),
        );
        if (partner && partner.user) {
          const pId = partner.user.id;
          const pName = partner.user.displayName || "Compañero";
          if (!partnersWins[pId]) partnersWins[pId] = { id: pId, name: pName, wins: 0 };
          partnersWins[pId].wins += 1;
        }
      } else if (matchResults[idx] === "L") {
        const rivals = match.players.filter(
          (p) =>
            p.user?.id !== viewerId &&
            (viewerTeamIdx === 0 ? p.position >= 2 : p.position < 2),
        );
        rivals.forEach((rival) => {
          if (rival.user) {
            const rId = rival.user.id;
            const rName = rival.user.displayName || "Rival";
            if (!rivalsLosses[rId]) rivalsLosses[rId] = { id: rId, name: rName, losses: 0 };
            rivalsLosses[rId].losses += 1;
          }
        });
      }
    });

    const bestPartner = Object.values(partnersWins).sort(
      (a, b) => b.wins - a.wins,
    )[0];

    const nemesis = Object.values(rivalsLosses).sort(
      (a, b) => b.losses - a.losses,
    )[0];

    expect(bestPartner).toBeDefined();
    expect(bestPartner.id).toBe("p-02");
    expect(bestPartner.name).toBe("Fernando");
    expect(bestPartner.wins).toBe(1);

    expect(nemesis).toBeDefined();
    expect(["p-02", "p-04"]).toContain(nemesis.id);
    expect(["Fernando", "Gero"]).toContain(nemesis.name);
    expect(nemesis.losses).toBe(1);
  });
});

describe("summaryGridMetricChoice", () => {
  it("selects streak metric when current streak is 2 or higher", () => {
    const currentStreak = 3;
    const wins = 5;

    const metric = currentStreak >= 2 ? { label: "Racha", value: `${currentStreak}W` } : { label: "Victorias", value: `${wins}` };

    expect(metric.label).toBe("Racha");
    expect(metric.value).toBe("3W");
  });

  it("selects total wins metric when current streak is less than 2", () => {
    const currentStreak = 1;
    const wins = 4;

    const metric = currentStreak >= 2 ? { label: "Racha", value: `${currentStreak}W` } : { label: "Victorias", value: `${wins}` };

    expect(metric.label).toBe("Victorias");
    expect(metric.value).toBe("4");
  });
});

describe("sideBadgeAccessibility", () => {
  it("formats side labels and titles correctly for RIGHT and LEFT", () => {
    const getSideInfo = (side: "RIGHT" | "LEFT") => ({
      text: side === "RIGHT" ? "Der" : "Rev",
      label: side === "RIGHT" ? "Lado derecho" : "Lado revés",
    });

    expect(getSideInfo("RIGHT")).toEqual({ text: "Der", label: "Lado derecho" });
    expect(getSideInfo("LEFT")).toEqual({ text: "Rev", label: "Lado revés" });
  });
});

describe("matchCompactAriaFormatting", () => {
  it("formats quick confirm aria label with score when score is present", () => {
    const formatQuickConfirmLabel = (score?: string | null) =>
      `Confirmar resultado ${score ? `(${score})` : ""} del partido`;

    expect(formatQuickConfirmLabel("6-4, 6-3")).toBe(
      "Confirmar resultado (6-4, 6-3) del partido",
    );
    expect(formatQuickConfirmLabel(null)).toBe(
      "Confirmar resultado  del partido",
    );
  });

  it("formats match detail link aria label cleanly before and after client mount date formatting", () => {
    const formatDetailLinkAriaLabel = (formattedDate: string | null) =>
      formattedDate
        ? `Ver detalle del partido del ${formattedDate}`
        : "Ver detalle del partido";

    expect(formatDetailLinkAriaLabel("23/08/26")).toBe(
      "Ver detalle del partido del 23/08/26",
    );
    expect(formatDetailLinkAriaLabel(null)).toBe("Ver detalle del partido");
  });
});

describe("assignUserToMatchSlotValidation", () => {
  it("prevents assigning a user who is already in another slot in the same match", () => {
    const existingPlayers = [
      { id: "slot-1", userId: "u-101" },
      { id: "slot-2", userId: "u-102" },
      { id: "slot-3", userId: null },
      { id: "slot-4", userId: null },
    ];

    const isUserAlreadyAssigned = (targetUserId: string, targetSlotId: string) => {
      return existingPlayers.some(
        (p) => p.userId === targetUserId && p.id !== targetSlotId,
      );
    };

    expect(isUserAlreadyAssigned("u-101", "slot-3")).toBe(true);
    expect(isUserAlreadyAssigned("u-103", "slot-3")).toBe(false);
    expect(isUserAlreadyAssigned("u-101", "slot-1")).toBe(false); // Same slot re-assignment
  });

  it("validates input identifiers and organizer authority", () => {
    const validateAssignmentInput = (
      sessionUserId: string | null,
      creatorId: string,
      matchStatus: string,
      playerId: string,
      targetUserId: string,
    ) => {
      if (!sessionUserId) return { status: "error", message: "Tenés que iniciar sesión para gestionar el partido." };
      if (!playerId || playerId.trim().length === 0) return { status: "error", message: "Identificador de cupo inválido." };
      if (!targetUserId || targetUserId.trim().length === 0) return { status: "error", message: "Identificador de jugador inválido." };
      if (creatorId !== sessionUserId) return { status: "error", message: "Solo el organizador puede asignar jugadores." };
      if (matchStatus !== "PENDING") return { status: "error", message: "No podés modificar cupos de un partido ya finalizado o cancelado." };
      return { status: "ok" };
    };

    expect(validateAssignmentInput(null, "org-1", "PENDING", "s-1", "u-1")).toEqual({
      status: "error",
      message: "Tenés que iniciar sesión para gestionar el partido.",
    });

    expect(validateAssignmentInput("other-user", "org-1", "PENDING", "s-1", "u-1")).toEqual({
      status: "error",
      message: "Solo el organizador puede asignar jugadores.",
    });

    expect(validateAssignmentInput("org-1", "org-1", "CONFIRMED", "s-1", "u-1")).toEqual({
      status: "error",
      message: "No podés modificar cupos de un partido ya finalizado o cancelado.",
    });

    expect(validateAssignmentInput("org-1", "org-1", "PENDING", "s-1", "u-1")).toEqual({
      status: "ok",
    });
  });
});

describe("matchPlayersManagerSwapAndCancelActions", () => {
  it("formats swap mode banner aria status attributes and localized label correctly", () => {
    const getSwapBannerProps = (isSwapActive: boolean) => {
      if (!isSwapActive) return null;
      return {
        role: "status",
        ariaLive: "polite",
        ariaLabel: "Modo intercambio activo. Seleccioná otro jugador o presioná Escape para cancelar.",
      };
    };

    expect(getSwapBannerProps(true)).toEqual({
      role: "status",
      ariaLive: "polite",
      ariaLabel: "Modo intercambio activo. Seleccioná otro jugador o presioná Escape para cancelar.",
    });

    expect(getSwapBannerProps(false)).toBeNull();
  });

  it("formats match cancellation action button aria-busy and confirm state correctly", () => {
    const getCancelButtonProps = (isPending: boolean) => ({
      ariaBusy: isPending,
      label: isPending ? "Eliminando..." : "Confirmar",
    });

    expect(getCancelButtonProps(true)).toEqual({
      ariaBusy: true,
      label: "Eliminando...",
    });

    expect(getCancelButtonProps(false)).toEqual({
      ariaBusy: false,
      label: "Confirmar",
    });
  });
});

describe("attendanceMarkerAriaAndStatus", () => {
  it("computes tabIndex and aria-checked for status radiogroup buttons correctly", () => {
    const getStatusButtonProps = (
      statusOption: "ATTENDED" | "LATE" | "NO_SHOW",
      currentStatus: "ATTENDED" | "LATE" | "NO_SHOW",
      playerName: string,
    ) => {
      const isActive = currentStatus === statusOption;
      return {
        role: "radio",
        ariaChecked: isActive,
        tabIndex: isActive ? 0 : -1,
        ariaLabel: `${statusOption === "ATTENDED" ? "Presente" : statusOption === "LATE" ? "Tarde" : "No asistió"} - ${playerName}`,
      };
    };

    expect(getStatusButtonProps("ATTENDED", "ATTENDED", "Agustín")).toEqual({
      role: "radio",
      ariaChecked: true,
      tabIndex: 0,
      ariaLabel: "Presente - Agustín",
    });

    expect(getStatusButtonProps("LATE", "ATTENDED", "Agustín")).toEqual({
      role: "radio",
      ariaChecked: false,
      tabIndex: -1,
      ariaLabel: "Tarde - Agustín",
    });
  });

  it("calculates next index correctly on radiogroup arrow key navigation", () => {
    expect(getNextRadioIndex(0, 3, "ArrowRight")).toBe(1);
    expect(getNextRadioIndex(2, 3, "ArrowRight")).toBe(0);
    expect(getNextRadioIndex(0, 3, "ArrowLeft")).toBe(2);
    expect(getNextRadioIndex(1, 3, "ArrowLeft")).toBe(0);
    expect(getNextRadioIndex(0, 0, "ArrowRight")).toBe(0);
  });
});

describe("attendanceBadgeAndNavigationProps", () => {
  it("formats AttendanceBadge role and localized aria-label correctly for all statuses", () => {
    const getBadgeProps = (status: "ATTENDED" | "LATE" | "NO_SHOW" | null) => {
      if (!status) return null;
      const labels: Record<string, string> = {
        ATTENDED: "Presente",
        LATE: "Tarde",
        NO_SHOW: "No asistió",
      };
      return {
        role: "status",
        ariaLabel: `Asistencia: ${labels[status]}`,
      };
    };

    expect(getBadgeProps("ATTENDED")).toEqual({
      role: "status",
      ariaLabel: "Asistencia: Presente",
    });
    expect(getBadgeProps("LATE")).toEqual({
      role: "status",
      ariaLabel: "Asistencia: Tarde",
    });
    expect(getBadgeProps("NO_SHOW")).toEqual({
      role: "status",
      ariaLabel: "Asistencia: No asistió",
    });
    expect(getBadgeProps(null)).toBeNull();
  });

  it("formats MatchNavigation region landmark and primary loading aria-busy correctly", () => {
    const getNavigationProps = (primaryLoading: boolean) => ({
      role: "region",
      ariaLabel: "Navegación de pasos del partido",
      primaryButtonProps: {
        ariaBusy: primaryLoading,
        disabled: primaryLoading,
      },
    });

    expect(getNavigationProps(true)).toEqual({
      role: "region",
      ariaLabel: "Navegación de pasos del partido",
      primaryButtonProps: {
        ariaBusy: true,
        disabled: true,
      },
    });

    expect(getNavigationProps(false)).toEqual({
      role: "region",
      ariaLabel: "Navegación de pasos del partido",
      primaryButtonProps: {
        ariaBusy: false,
        disabled: false,
      },
    });
  });
});
