import { describe, it, expect, vi } from "vitest";
import React from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/(app)/turnos/actions", () => ({
  openToNetworkAction: vi.fn(),
}));

import { OpenToNetworkButton } from "../open-to-network-button";
import { getCooldownRemainingMinutes } from "../turn-utils";

describe("OpenToNetworkButton Component", () => {
  it("creates valid React element with default props", () => {
    const element = React.createElement(OpenToNetworkButton, {
      turnId: "turn-123",
      club: "Club Padel Pro",
    });

    expect(element.type).toBe(OpenToNetworkButton);
    expect(element.props.turnId).toBe("turn-123");
    expect(element.props.club).toBe("Club Padel Pro");
  });

  it("calculates 1-hour notification cooldown accurately", () => {
    const nowMs = new Date("2026-09-04T12:00:00Z").getTime();

    // 30 minutes ago
    const thirtyMinAgo = new Date("2026-09-04T11:30:00Z").toISOString();
    expect(getCooldownRemainingMinutes(thirtyMinAgo, nowMs)).toBe(30);

    // 61 minutes ago (expired)
    const expired = new Date("2026-09-04T10:59:00Z").toISOString();
    expect(getCooldownRemainingMinutes(expired, nowMs)).toBe(0);

    // Null timestamp
    expect(getCooldownRemainingMinutes(null, nowMs)).toBe(0);
  });

  it("passes cooldown and accessibility props correctly", () => {
    const pastDate = new Date(Date.now() - 15 * 60 * 1000).toISOString(); // 15 mins ago
    const element = React.createElement(OpenToNetworkButton, {
      turnId: "turn-456",
      club: "Central Padel",
      lastNetworkNotificationAt: pastDate,
      showText: false,
    });

    expect(element.props.lastNetworkNotificationAt).toBe(pastDate);
    expect(element.props.showText).toBe(false);
  });
});
