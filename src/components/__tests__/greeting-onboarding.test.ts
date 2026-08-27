import { describe, it, expect } from "vitest";
import { getOnboardingProgressCount } from "../greeting";

describe("getOnboardingProgressCount", () => {
  it("returns 0 when no steps are completed", () => {
    const count = getOnboardingProgressCount({
      hasAlias: false,
      hasActivity: false,
      isPwaInstalled: false,
      hasNotifications: false,
    });
    expect(count).toBe(0);
  });

  it("returns 1 when only alias is set", () => {
    const count = getOnboardingProgressCount({
      hasAlias: true,
      hasActivity: false,
      isPwaInstalled: false,
      hasNotifications: false,
    });
    expect(count).toBe(1);
  });

  it("returns 2 when alias and activity exist", () => {
    const count = getOnboardingProgressCount({
      hasAlias: true,
      hasActivity: true,
      isPwaInstalled: false,
      hasNotifications: false,
    });
    expect(count).toBe(2);
  });

  it("returns 3 when alias, activity, and PWA are completed", () => {
    const count = getOnboardingProgressCount({
      hasAlias: true,
      hasActivity: true,
      isPwaInstalled: true,
      hasNotifications: false,
    });
    expect(count).toBe(3);
  });

  it("returns 4 when all steps are completed", () => {
    const count = getOnboardingProgressCount({
      hasAlias: true,
      hasActivity: true,
      isPwaInstalled: true,
      hasNotifications: true,
    });
    expect(count).toBe(4);
  });
});
