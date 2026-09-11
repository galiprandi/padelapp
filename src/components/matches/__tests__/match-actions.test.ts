import { describe, it, expect, vi } from "vitest";
import React from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
}));

vi.mock("@/components/toast/use-toast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("@/app/(app)/match/actions", () => ({
  cancelMatchAction: vi.fn(),
  confirmMatchResultAction: vi.fn(),
  finalizeMatchAction: vi.fn(),
}));

import {
  CancelMatchForm,
  ConfirmResultForm,
  FinalizeMatchForm,
} from "../match-actions";

describe("MatchActions Components", () => {
  it("creates valid React element for CancelMatchForm", () => {
    const element = React.createElement(CancelMatchForm, { matchId: "match-1" });
    expect(element.type).toBe(CancelMatchForm);
    expect(element.props.matchId).toBe("match-1");
  });

  it("creates valid React element for ConfirmResultForm", () => {
    const element = React.createElement(ConfirmResultForm, { matchId: "match-2" });
    expect(element.type).toBe(ConfirmResultForm);
    expect(element.props.matchId).toBe("match-2");
  });

  it("creates valid React element for FinalizeMatchForm", () => {
    const element = React.createElement(FinalizeMatchForm, { matchId: "match-3" });
    expect(element.type).toBe(FinalizeMatchForm);
    expect(element.props.matchId).toBe("match-3");
  });
});
