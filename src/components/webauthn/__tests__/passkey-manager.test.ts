import { describe, it, expect, vi } from "vitest";
import React from "react";

vi.mock("@/lib/webauthn/actions", () => ({
  getRegistrationOptions: vi.fn(),
  verifyRegistration: vi.fn(),
  deletePasskey: vi.fn(),
  getAuthOptions: vi.fn(),
  verifyAuth: vi.fn(),
}));

vi.mock("@simplewebauthn/browser", () => ({
  startRegistration: vi.fn(),
  startAuthentication: vi.fn(),
  browserSupportsWebAuthn: vi.fn(() => true),
  platformAuthenticatorIsAvailable: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

import { PasskeyManager } from "../passkey-manager";
import { PasskeyLoginButton } from "../passkey-login-button";

describe("PasskeyManager Component", () => {
  it("creates valid React element with initialPasskeys", () => {
    const mockPasskeys = [
      {
        credentialId: "cred-1",
        nickname: "Mi iPhone",
        deviceType: "singleDevice",
        createdAt: new Date("2026-01-01"),
      },
    ];

    const element = React.createElement(PasskeyManager, {
      initialPasskeys: mockPasskeys,
    });

    expect(element.type).toBe(PasskeyManager);
    expect(element.props.initialPasskeys).toHaveLength(1);
    expect(element.props.initialPasskeys[0].nickname).toBe("Mi iPhone");
  });

  it("handles empty initialPasskeys array", () => {
    const element = React.createElement(PasskeyManager, {
      initialPasskeys: [],
    });

    expect(element.type).toBe(PasskeyManager);
    expect(element.props.initialPasskeys).toEqual([]);
  });
});

describe("PasskeyLoginButton Component", () => {
  it("creates valid React element", () => {
    const element = React.createElement(PasskeyLoginButton);

    expect(element.type).toBe(PasskeyLoginButton);
  });
});
