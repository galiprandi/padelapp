"use server";

import { auth } from "@/auth";
import { Redis } from "@upstash/redis";

export interface ChatMessage {
  id: string;
  userId: string;
  alias: string;
  type: "user" | "system";
  text: string;
  ts: number; // Unix timestamp in seconds
}

// Global in-memory storage for local fallback when Redis is not configured
const globalMemoryStore = new Map<string, ChatMessage[]>();

// Initialize Upstash Redis client conditionally
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const TTL_90_DAYS = 7776000; // 90 days in seconds

/**
 * Helper to generate high-fidelity mock messages under mock/bypass conditions.
 */
function getMockMessages(turnId: string): ChatMessage[] {
  const now = Math.floor(Date.now() / 1000);
  return [
    {
      id: `${turnId}-mock-1`,
      userId: "gero-id",
      alias: "Gero",
      type: "user",
      text: "¿Alguien trae pelotas?",
      ts: now - 600,
    },
    {
      id: `${turnId}-mock-2`,
      userId: "facu-id",
      alias: "Facu",
      type: "user",
      text: "Yo llevo un tubo cerrado, quedate tranquilo.",
      ts: now - 500,
    },
    {
      id: `${turnId}-mock-3`,
      userId: "gero-id",
      alias: "Gero",
      type: "user",
      text: "Buenísimo. Yo llego sobre la hora, dejen armada la cancha.",
      ts: now - 300,
    },
    {
      id: `${turnId}-mock-4`,
      userId: "system-bot",
      alias: "Sistema",
      type: "system",
      text: "✅ Turno completo. Nos vemos en la cancha.",
      ts: now - 200,
    },
  ];
}

/**
 * Loads messages for a turn.
 */
export async function getMessagesAction(turnId: string): Promise<ChatMessage[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  const isBypass = process.env.AUTH_BYPASS === "true" || process.env.MOCK_AUTH === "true";

  if (redis) {
    try {
      const key = `turn:${turnId}:messages`;
      const rawMessages = await redis.lrange<string>(key, 0, -1);

      if (rawMessages.length === 0 && isBypass) {
        return getMockMessages(turnId);
      }

      return rawMessages.map((msg) => {
        if (typeof msg === "string") {
          return JSON.parse(msg) as ChatMessage;
        }
        return msg as unknown as ChatMessage;
      });
    } catch (e) {
      console.error("Error reading from Redis, falling back to memory:", e);
    }
  }

  // Fallback to global in-memory store
  let messages = globalMemoryStore.get(turnId) || [];
  if (messages.length === 0 && isBypass) {
    messages = getMockMessages(turnId);
    globalMemoryStore.set(turnId, messages);
  }
  return messages;
}

/**
 * Sends a message from the current user.
 */
export async function sendMessageAction(
  turnId: string,
  text: string
): Promise<{ status: "ok" | "error"; message?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "No autorizado" };
  }

  const cleanText = text.trim();
  if (!cleanText) {
    return { status: "error", message: "El mensaje no puede estar vacío" };
  }

  if (cleanText.length > 300) {
    return { status: "error", message: "El mensaje es demasiado largo (máximo 300 caracteres)" };
  }

  const userAlias = session.user.alias || session.user.name || "Jugador";

  const newMessage: ChatMessage = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    userId: session.user.id,
    alias: userAlias,
    type: "user",
    text: cleanText,
    ts: Math.floor(Date.now() / 1000),
  };

  if (redis) {
    try {
      const key = `turn:${turnId}:messages`;
      await redis.rpush(key, JSON.stringify(newMessage));
      await redis.expire(key, TTL_90_DAYS);
      return { status: "ok" };
    } catch (e) {
      console.error("Error writing to Redis, falling back to memory:", e);
    }
  }

  // Fallback to global in-memory store
  const messages = globalMemoryStore.get(turnId) || [];
  messages.push(newMessage);
  globalMemoryStore.set(turnId, messages);
  return { status: "ok" };
}

/**
 * Server-only utility to write system bot messages.
 */
export async function sendSystemMessageAction(
  turnId: string,
  text: string
): Promise<{ status: "ok" | "error"; message?: string }> {
  const cleanText = text.trim();
  if (!cleanText) {
    return { status: "error", message: "El mensaje no puede estar vacío" };
  }

  const systemMessage: ChatMessage = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    userId: "system-bot",
    alias: "Sistema",
    type: "system",
    text: cleanText,
    ts: Math.floor(Date.now() / 1000),
  };

  if (redis) {
    try {
      const key = `turn:${turnId}:messages`;
      await redis.rpush(key, JSON.stringify(systemMessage));
      await redis.expire(key, TTL_90_DAYS);
      return { status: "ok" };
    } catch (e) {
      console.error("Error writing system message to Redis, falling back to memory:", e);
    }
  }

  // Fallback to global in-memory store
  const messages = globalMemoryStore.get(turnId) || [];
  messages.push(systemMessage);
  globalMemoryStore.set(turnId, messages);
  return { status: "ok" };
}
