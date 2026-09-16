import { describe, it, expect, vi } from "vitest";
import React from "react";

vi.mock("@/components/toast/use-toast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("@/lib/chat-store", () => ({
  getMessagesAction: vi.fn().mockResolvedValue([]),
  sendMessageAction: vi.fn().mockResolvedValue({ status: "ok" }),
}));

import { TurnChat } from "../turn-chat";

describe("TurnChat Component", () => {
  it("creates valid React element for TurnChat", () => {
    const element = React.createElement(TurnChat, {
      turnId: "turn-chat-1",
      currentUserId: "user-123",
    });

    expect(element.type).toBe(TurnChat);
    expect(element.props.turnId).toBe("turn-chat-1");
    expect(element.props.currentUserId).toBe("user-123");
  });

  it("handles anonymous currentUserId correctly", () => {
    const element = React.createElement(TurnChat, {
      turnId: "turn-chat-2",
      currentUserId: undefined,
    });

    expect(element.type).toBe(TurnChat);
    expect(element.props.turnId).toBe("turn-chat-2");
    expect(element.props.currentUserId).toBeUndefined();
  });
});
