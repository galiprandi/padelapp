import { describe, it, expect, vi } from "vitest";
import React from "react";
import {
  WhatsAppInviteButton,
  WhatsAppGroupInviteButton,
} from "../whatsapp-invite-button";

// Mock useToast hook
vi.mock("@/components/toast/use-toast", () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe("WhatsAppInviteButton", () => {
  it("renders correctly with accessibility attributes and wa.me href", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(19, 0, 0, 0);

    const element = React.createElement(WhatsAppInviteButton, {
      club: "Central Padel",
      date: futureDate,
      contactName: "Mateo",
      openSlots: 1,
      shareUrl: "https://padelred.app/t/123",
    });

    expect(element.type).toBe(WhatsAppInviteButton);
    expect(element.props.club).toBe("Central Padel");
    expect(element.props.contactName).toBe("Mateo");
  });
});

describe("WhatsAppGroupInviteButton", () => {
  it("renders correctly with accessibility attributes, variant styles and wa.me href", () => {
    const futureDate = new Date();
    futureDate.setFullYear(2026, 7, 25);
    futureDate.setHours(20, 0, 0, 0);

    const elementDefault = React.createElement(WhatsAppGroupInviteButton, {
      club: "Padel Park",
      date: futureDate,
      openSlots: 2,
      shareUrl: "https://padelred.app/t/group456",
      variant: "default",
    });

    expect(elementDefault.type).toBe(WhatsAppGroupInviteButton);
    expect(elementDefault.props.variant).toBe("default");

    const elementAmber = React.createElement(WhatsAppGroupInviteButton, {
      club: "Padel Park",
      date: futureDate,
      openSlots: 1,
      shareUrl: "https://padelred.app/t/group456",
      variant: "amber",
    });

    expect(elementAmber.props.variant).toBe("amber");
  });
});
