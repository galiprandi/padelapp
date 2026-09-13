import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

vi.mock("@/lib/webauthn/actions", () => ({
  getRegistrationOptions: vi.fn(),
  verifyRegistration: vi.fn(),
}));

vi.mock("@simplewebauthn/browser", () => ({
  startRegistration: vi.fn(),
  browserSupportsWebAuthn: vi.fn(() => false),
  platformAuthenticatorIsAvailable: vi.fn(() => Promise.resolve(false)),
}));

import {
  PasskeyOnboarding,
  PASSKEY_ONBOARDING_DISMISS_KEY,
  isPasskeyOnboardingDismissed,
  dismissPasskeyOnboarding,
  clearPasskeyOnboardingDismissal,
} from "../passkey-onboarding";

describe("PasskeyOnboarding Storage Helpers", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const sessionStorageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
      length: 0,
      key: vi.fn(() => null),
    };

    vi.stubGlobal("window", { sessionStorage: sessionStorageMock });
    vi.stubGlobal("sessionStorage", sessionStorageMock);
  });

  it("returns false for isPasskeyOnboardingDismissed when storage is empty", () => {
    expect(isPasskeyOnboardingDismissed()).toBe(false);
  });

  it("sets dismiss key in sessionStorage via dismissPasskeyOnboarding", () => {
    dismissPasskeyOnboarding();
    expect(mockStorage[PASSKEY_ONBOARDING_DISMISS_KEY]).toBe("1");
    expect(isPasskeyOnboardingDismissed()).toBe(true);
  });

  it("clears dismiss key from sessionStorage via clearPasskeyOnboardingDismissal", () => {
    dismissPasskeyOnboarding();
    expect(isPasskeyOnboardingDismissed()).toBe(true);
    clearPasskeyOnboardingDismissal();
    expect(isPasskeyOnboardingDismissed()).toBe(false);
  });
});

describe("PasskeyOnboarding Component", () => {
  it("creates valid React element with hasPasskeys false", () => {
    const element = React.createElement(PasskeyOnboarding, {
      hasPasskeys: false,
    });

    expect(element.type).toBe(PasskeyOnboarding);
    expect(element.props.hasPasskeys).toBe(false);
  });

  it("creates valid React element with hasPasskeys true", () => {
    const element = React.createElement(PasskeyOnboarding, {
      hasPasskeys: true,
    });

    expect(element.type).toBe(PasskeyOnboarding);
    expect(element.props.hasPasskeys).toBe(true);
  });
});
