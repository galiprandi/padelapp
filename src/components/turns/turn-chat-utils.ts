/**
 * Localized chat message timestamp formatting helper.
 * Formats:
 * - Today: "19:30"
 * - Yesterday: "Ayer, 19:30"
 * - Older: "D/M, 19:30"
 */
export interface QuickSuggestion {
  id: string;
  label: string;
  text: string;
}

export const CHAT_QUICK_SUGGESTIONS: QuickSuggestion[] = [
  { id: "late", label: "⏱️ Llego 10 min tarde", text: "Llego 10 min tarde" },
  { id: "balls", label: "🎾 ¿Llevan pelotas?", text: "¿Alguien lleva pelotas?" },
  { id: "confirmed", label: "👍 Confirmado", text: "Confirmado 👍" },
  { id: "court", label: "📍 ¿Qué cancha es?", text: "¿Saben qué cancha nos toca?" },
];

export function formatChatTime(ts: number, baseDate?: Date): string {
  const d = new Date(ts * 1000);
  const now = baseDate || new Date();

  const hour = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const timeStr = `${hour}:${minutes}`;

  // Check if today
  const isTodayDate =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isTodayDate) {
    return timeStr;
  }

  // Check if yesterday
  const yesterday = new Date(now.getTime());
  yesterday.setDate(now.getDate() - 1);
  const isYesterdayDate =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterdayDate) {
    return `Ayer, ${timeStr}`;
  }

  // Older: show day and month
  const day = d.getDate();
  const month = d.getMonth() + 1;
  return `${day}/${month}, ${timeStr}`;
}

export interface ChatValidationResult {
  isValid: boolean;
  cleanText: string;
  error?: string;
}

/**
 * Validates a chat message payload for length and non-emptiness.
 */
export function validateChatMessage(text: string): ChatValidationResult {
  const cleanText = (text ?? "").trim();
  if (!cleanText) {
    return {
      isValid: false,
      cleanText: "",
      error: "El mensaje no puede estar vacío",
    };
  }

  if (cleanText.length > 300) {
    return {
      isValid: false,
      cleanText,
      error: "El mensaje es demasiado largo (máximo 300 caracteres)",
    };
  }

  return {
    isValid: true,
    cleanText,
  };
}

/**
 * Generates an accessible screen reader label for a chat message.
 */
export function getChatMessageAriaLabel(
  msg: { userId: string; alias: string; type: "user" | "system"; text: string; ts: number },
  currentUserId?: string,
  baseDate?: Date,
): string {
  const formattedTime = formatChatTime(msg.ts, baseDate);
  const isSystem = msg.type === "system" || msg.userId === "system-bot";

  if (isSystem) {
    return `Aviso del sistema (${formattedTime}): ${msg.text}`;
  }

  const isMe = msg.userId === currentUserId || msg.alias === "Vos";
  const sender = isMe ? "Vos" : msg.alias;
  return `Mensaje de ${sender} (${formattedTime}): ${msg.text}`;
}

/**
 * Generates an accessible screen reader label for quick chat suggestion chips.
 */
export function getQuickChipAriaLabel(text: string): string {
  return `Usar atajo: ${text}`;
}

/**
 * Generates an accessible screen reader label for the chat region landmark.
 */
export function getChatRegionAriaLabel(): string {
  return "Chat de coordinación del turno de pádel";
}

/**
 * Generates a dynamic screen reader label for the chat history log container.
 */
export function getChatLogAriaLabel(count: number): string {
  if (count <= 0) {
    return "Historial del chat del turno, sin mensajes";
  }
  if (count === 1) {
    return "Historial del chat del turno, 1 mensaje";
  }
  return `Historial del chat del turno, ${count} mensajes`;
}

/**
 * Generates an accessible screen reader label for the chat message input field.
 */
export function getChatInputAriaLabel(isSending: boolean): string {
  return isSending ? "Enviando mensaje..." : "Escribir mensaje para el chat del turno";
}

/**
 * Generates an accessible screen reader label for the character counter status.
 */
export function getChatCharacterCounterAriaLabel(currentLength: number, maxLength: number = 300): string {
  const remaining = maxLength - currentLength;
  return `${currentLength} de ${maxLength} caracteres (${remaining} restantes)`;
}
