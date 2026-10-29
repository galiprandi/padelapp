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

/**
 * Returns localized loading text for Turn Chat.
 */
export function getChatLoadingText(): string {
  return "Cargando chat del turno...";
}

/**
 * Returns localized empty state text when no messages exist in Turn Chat.
 */
export function getChatEmptyStateText(): string {
  return "No hay mensajes todavía. Escribí el primero para organizar.";
}

/**
 * Returns localized shortcuts label text.
 */
export function getChatShortcutsTitleText(): string {
  return "Atajos:";
}

/**
 * Returns localized ARIA label for the shortcuts bar region landmark.
 */
export function getChatShortcutsRegionAriaLabel(): string {
  return "Atajos de mensajes rápidos";
}

/**
 * Returns localized input placeholder text for Turn Chat.
 */
export function getChatInputPlaceholderText(): string {
  return "Escribí un mensaje...";
}

/**
 * Returns localized send button ARIA label.
 */
export function getChatSendButtonAriaLabel(isSending: boolean): string {
  return isSending ? "Enviando mensaje..." : "Enviar mensaje";
}

/**
 * Returns CSS classes for Turn Chat message bubbles based on sender identity.
 */
export function getChatBubbleClasses(isMe: boolean): string {
  return isMe
    ? "bg-primary text-primary-foreground rounded-tr-none"
    : "bg-muted text-foreground border border-border rounded-tl-none";
}

/**
 * Returns CSS color classes for the Turn Chat character counter based on length.
 */
export function getChatCounterTextClasses(currentLength: number): string {
  if (currentLength >= 290) {
    return "text-destructive";
  }
  if (currentLength >= 250) {
    return "text-amber-600 dark:text-amber-400";
  }
  return "text-muted-foreground";
}

/**
 * Returns CSS classes for Turn Chat loading container.
 */
export function getChatLoadingContainerClasses(): string {
  return "flex h-48 items-center justify-center rounded-xl border border-border bg-card shadow-xs";
}

/**
 * Returns CSS classes for Turn Chat outer container.
 */
export function getChatContainerClasses(): string {
  return "flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-xs";
}

/**
 * Returns CSS classes for Turn Chat message history log container.
 */
export function getChatLogClasses(): string {
  return "flex-1 overflow-y-auto p-4 space-y-3 max-h-72 min-h-[18rem] bg-card";
}

/**
 * Returns CSS classes for Turn Chat system message bubble.
 */
export function getChatSystemMessageBubbleClasses(): string {
  return "rounded-lg bg-muted px-3 py-1.5 border border-border text-[11px] font-semibold text-muted-foreground text-center max-w-[85%] leading-normal shadow-xs";
}

/**
 * Returns CSS classes for Turn Chat quick shortcuts bar container.
 */
export function getChatShortcutsBarClasses(): string {
  return "px-3 py-2 bg-muted/60 border-t border-border flex items-center gap-1.5 overflow-x-auto scrollbar-none";
}

/**
 * Returns CSS classes for Turn Chat quick suggestion shortcut chip buttons.
 */
export function getChatShortcutChipClasses(): string {
  return "rounded-full bg-card hover:bg-muted border border-border px-2.5 py-1 text-xs font-semibold text-foreground transition-all shrink-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background shadow-xs";
}

/**
 * Returns CSS classes for Turn Chat input form.
 */
export function getChatFormClasses(): string {
  return "border-t border-border p-3 bg-muted flex flex-col gap-1.5";
}

/**
 * Returns CSS classes for Turn Chat message text input.
 */
export function getChatInputClasses(): string {
  return "h-10 rounded-lg bg-card border-border placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background text-sm flex-1";
}

/**
 * Returns CSS classes for Turn Chat send button.
 */
export function getChatSendButtonClasses(): string {
  return "h-10 w-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all";
}

/**
 * Returns CSS classes for Turn Chat loading spinner icon.
 */
export function getChatLoadingSpinnerClasses(): string {
  return "h-6 w-6 animate-spin text-primary";
}

/**
 * Returns CSS classes for Turn Chat sending spinner icon.
 */
export function getChatSendSpinnerClasses(): string {
  return "h-4 w-4 animate-spin";
}

/**
 * Returns CSS classes for Turn Chat send icon.
 */
export function getChatSendIconClasses(): string {
  return "h-4 w-4";
}
