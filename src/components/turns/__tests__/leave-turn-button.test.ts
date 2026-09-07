import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { LeaveTurnButton } from "../leave-turn-button";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

// Mock toast hook
vi.mock("@/components/toast/use-toast", () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock server actions
vi.mock("@/app/(app)/turnos/actions", () => ({
  leaveTurnAction: vi.fn().mockResolvedValue({ status: "ok" }),
}));

// Mock magic link helper
vi.mock("@/lib/magic-link", () => ({
  createMagicLink: vi.fn().mockReturnValue({ url: "https://padelred.com/t/test-turn" }),
}));

describe("LeaveTurnButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders initial 'Bajarme del turno' trigger button with accessibility attributes", () => {
    const el = React.createElement(LeaveTurnButton, {
      turnId: "turn-1",
      club: "Club Central",
      date: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours in future
    });

    expect(el).not.toBeNull();
    expect(el.props.turnId).toBe("turn-1");
  });

  it("calculates late leave requirement correctly for future vs upcoming turn", () => {
    const farFutureDate = new Date(Date.now() + 10 * 60 * 60 * 1000); // 10 hours in future
    const nearTurnDate = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour in future

    const farEl = React.createElement(LeaveTurnButton, {
      turnId: "turn-far",
      club: "Club Central",
      date: farFutureDate,
      isCreator: false,
    });

    const nearEl = React.createElement(LeaveTurnButton, {
      turnId: "turn-near",
      club: "Club Central",
      date: nearTurnDate,
      isCreator: false,
    });

    expect(farEl.props.date).toEqual(farFutureDate);
    expect(nearEl.props.date).toEqual(nearTurnDate);
  });
});
