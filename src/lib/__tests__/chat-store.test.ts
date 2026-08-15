import { describe, it, expect, vi } from "vitest";
import { sendSystemMessageAction, getMessagesAction } from "@/lib/chat-store";

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "p-01", name: "Agustín", alias: "agu" },
  }),
}));

describe("Chat Store System Messages", () => {
  it("rejects empty system message text", async () => {
    const res = await sendSystemMessageAction("turn-test-1", "   ");
    expect(res).toEqual({
      status: "error",
      message: "El mensaje no puede estar vacío",
    });
  });

  it("successfully stores and retrieves system bot messages", async () => {
    const turnId = "turn-test-system-1";
    const messageText = "El organizador promovió a Fernando a titular.";

    const sendRes = await sendSystemMessageAction(turnId, messageText);
    expect(sendRes).toEqual({ status: "ok" });

    const messages = await getMessagesAction(turnId);
    const systemMsg = messages.find((m) => m.text === messageText);

    expect(systemMsg).toBeDefined();
    expect(systemMsg?.type).toBe("system");
    expect(systemMsg?.userId).toBe("system-bot");
    expect(systemMsg?.alias).toBe("Sistema");
  });
});
