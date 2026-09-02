import { describe, it, expect } from "vitest";
import { calculateOnboardingProgress } from "../onboarding-checklist";

describe("calculateOnboardingProgress", () => {
  it("returns 0 count and 0% progress when no steps are completed", () => {
    const result = calculateOnboardingProgress({
      stepAliasCompleted: false,
      stepActivityCompleted: false,
      stepPwaCompleted: false,
      stepNotificationsCompleted: false,
    });
    expect(result.completedCount).toBe(0);
    expect(result.progressPercent).toBe(0);
  });

  it("returns 1 count and 25% progress when alias is set", () => {
    const result = calculateOnboardingProgress({
      stepAliasCompleted: true,
      stepActivityCompleted: false,
      stepPwaCompleted: false,
      stepNotificationsCompleted: false,
    });
    expect(result.completedCount).toBe(1);
    expect(result.progressPercent).toBe(25);
  });

  it("returns 1 count and 25% progress when only activity is completed", () => {
    const result = calculateOnboardingProgress({
      stepAliasCompleted: false,
      stepActivityCompleted: true,
      stepPwaCompleted: false,
      stepNotificationsCompleted: false,
    });
    expect(result.completedCount).toBe(1);
    expect(result.progressPercent).toBe(25);
  });

  it("returns 2 count and 50% progress when alias and PWA are completed", () => {
    const result = calculateOnboardingProgress({
      stepAliasCompleted: true,
      stepActivityCompleted: false,
      stepPwaCompleted: true,
      stepNotificationsCompleted: false,
    });
    expect(result.completedCount).toBe(2);
    expect(result.progressPercent).toBe(50);
  });

  it("returns 3 count and 75% progress when alias, activity, and notifications are completed", () => {
    const result = calculateOnboardingProgress({
      stepAliasCompleted: true,
      stepActivityCompleted: true,
      stepPwaCompleted: false,
      stepNotificationsCompleted: true,
    });
    expect(result.completedCount).toBe(3);
    expect(result.progressPercent).toBe(75);
  });

  it("returns 4 count and 100% progress when all onboarding steps are completed", () => {
    const result = calculateOnboardingProgress({
      stepAliasCompleted: true,
      stepActivityCompleted: true,
      stepPwaCompleted: true,
      stepNotificationsCompleted: true,
    });
    expect(result.completedCount).toBe(4);
    expect(result.progressPercent).toBe(100);
  });
});
