import { describe, it, expect, vi } from "vitest";
import React from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
}));

vi.mock("@/components/toast/use-toast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("@/app/(app)/turnos/actions", () => ({
  cancelTurnAction: vi.fn(),
  convertTurnToMatchAction: vi.fn(),
  joinTurnAction: vi.fn(),
  joinSubstituteAction: vi.fn(),
  leaveSubstituteAction: vi.fn(),
  takeOpenSlotAction: vi.fn(),
  scheduleNextTurnAction: vi.fn(),
  markTurnAsPlayedAction: vi.fn(),
}));

import {
  CancelTurnForm,
  QuickJoinEmptySlotButton,
  StartMatchForm,
  JoinTurnForm,
  JoinSubstituteForm,
  LeaveSubstituteForm,
  TakeOpenSlotForm,
  ScheduleNextTurnForm,
  PlayCasualForm,
} from "../turn-actions";

describe("TurnActions Components", () => {
  it("creates valid React element for CancelTurnForm", () => {
    const element = React.createElement(CancelTurnForm, { turnId: "turn-1" });
    expect(element.type).toBe(CancelTurnForm);
    expect(element.props.turnId).toBe("turn-1");
  });

  it("creates valid React element for QuickJoinEmptySlotButton", () => {
    const element = React.createElement(QuickJoinEmptySlotButton, {
      turnId: "turn-2",
    });
    expect(element.type).toBe(QuickJoinEmptySlotButton);
    expect(element.props.turnId).toBe("turn-2");
  });

  it("creates valid React element for StartMatchForm", () => {
    const element = React.createElement(StartMatchForm, { turnId: "turn-3" });
    expect(element.type).toBe(StartMatchForm);
    expect(element.props.turnId).toBe("turn-3");
  });

  it("creates valid React element for JoinTurnForm", () => {
    const element = React.createElement(JoinTurnForm, { turnId: "turn-4" });
    expect(element.type).toBe(JoinTurnForm);
    expect(element.props.turnId).toBe("turn-4");
  });

  it("creates valid React element for JoinSubstituteForm", () => {
    const element = React.createElement(JoinSubstituteForm, {
      turnId: "turn-5",
    });
    expect(element.type).toBe(JoinSubstituteForm);
    expect(element.props.turnId).toBe("turn-5");
  });

  it("creates valid React element for LeaveSubstituteForm with open slots prop", () => {
    const element = React.createElement(LeaveSubstituteForm, {
      turnId: "turn-6",
      hasOpenSlot: true,
    });
    expect(element.type).toBe(LeaveSubstituteForm);
    expect(element.props.turnId).toBe("turn-6");
    expect(element.props.hasOpenSlot).toBe(true);
  });

  it("creates valid React element for TakeOpenSlotForm", () => {
    const element = React.createElement(TakeOpenSlotForm, {
      turnId: "turn-7",
    });
    expect(element.type).toBe(TakeOpenSlotForm);
    expect(element.props.turnId).toBe("turn-7");
  });

  it("creates valid React element for ScheduleNextTurnForm", () => {
    const element = React.createElement(ScheduleNextTurnForm, {
      turnId: "turn-8",
    });
    expect(element.type).toBe(ScheduleNextTurnForm);
    expect(element.props.turnId).toBe("turn-8");
  });

  it("creates valid React element for PlayCasualForm", () => {
    const element = React.createElement(PlayCasualForm, {
      turnId: "turn-9",
    });
    expect(element.type).toBe(PlayCasualForm);
    expect(element.props.turnId).toBe("turn-9");
  });
});
