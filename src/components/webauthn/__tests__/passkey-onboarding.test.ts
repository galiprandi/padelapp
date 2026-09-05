import { describe, it, expect, vi } from "vitest";
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

import { PasskeyOnboarding } from "../passkey-onboarding";

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
