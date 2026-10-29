"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useToast } from "@/components/toast/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMessagesAction,
  sendMessageAction,
  type ChatMessage,
} from "@/lib/chat-store";
import {
  formatChatTime,
  CHAT_QUICK_SUGGESTIONS,
  validateChatMessage,
  getChatMessageAriaLabel,
  getQuickChipAriaLabel,
  getChatRegionAriaLabel,
  getChatLogAriaLabel,
  getChatInputAriaLabel,
  getChatCharacterCounterAriaLabel,
  getChatLoadingText,
  getChatEmptyStateText,
  getChatShortcutsTitleText,
  getChatShortcutsRegionAriaLabel,
  getChatInputPlaceholderText,
  getChatSendButtonAriaLabel,
  getChatBubbleClasses,
  getChatCounterTextClasses,
  getChatLoadingContainerClasses,
  getChatContainerClasses,
  getChatLogClasses,
  getChatSystemMessageBubbleClasses,
  getChatShortcutsBarClasses,
  getChatShortcutChipClasses,
  getChatFormClasses,
  getChatInputClasses,
  getChatSendButtonClasses,
  getChatLoadingSpinnerClasses,
  getChatSendSpinnerClasses,
  getChatSendIconClasses,
} from "./turn-chat-utils";
import { getSendChatMessageErrorToast } from "./turn-utils";

interface TurnChatProps {
  turnId: string;
  currentUserId: string | undefined;
}

export function TurnChat({ turnId, currentUserId }: TurnChatProps) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, startSendingTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    let active = true;

    async function loadMessages(initial = false) {
      try {
        const msgs = await getMessagesAction(turnId);
        if (active) {
          setMessages(msgs);
          if (initial) {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Error loading chat messages:", err);
        if (initial && active) {
          setIsLoading(false);
        }
      }
    }

    loadMessages(true);
    const interval = setInterval(() => loadMessages(), 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [turnId]);

  const isFirstLoadRef = useRef(true);

  // Scroll to bottom on message load or new message
  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (messages.length > 0) {
      if (isFirstLoadRef.current) {
        scrollToBottom("auto");
        isFirstLoadRef.current = false;
      } else {
        scrollToBottom("smooth");
      }
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;

    const validation = validateChatMessage(inputText);
    if (!validation.isValid) {
      if (validation.error) {
        showToast(validation.error);
      }
      return;
    }

    const cleanText = validation.cleanText;

    // Optimistic UI update: add message locally first
    const tempId = `temp-${Date.now()}`;
    const tempMessage: ChatMessage = {
      id: tempId,
      userId: currentUserId || "anonymous",
      alias: "Vos",
      type: "user",
      text: cleanText,
      ts: Math.floor(Date.now() / 1000),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInputText("");

    startSendingTransition(async () => {
      const res = await sendMessageAction(turnId, cleanText);
      if (res.status === "error") {
        showToast(getSendChatMessageErrorToast(res.message));
        // Remove optimistic message if failed
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else {
        // Trigger immediate fetch to replace the temp message with high fidelity server payload
        const msgs = await getMessagesAction(turnId);
        setMessages(msgs);
      }
    });
  };

  if (isLoading) {
    return (
      <div
        role="region"
        aria-label={getChatRegionAriaLabel()}
        className={getChatLoadingContainerClasses()}
      >
        <div className="flex flex-col items-center gap-2" role="status" aria-live="polite">
          <Loader2 className={getChatLoadingSpinnerClasses()} aria-hidden="true" />
          <p className="text-xs text-muted-foreground font-medium">
            {getChatLoadingText()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={getChatRegionAriaLabel()}
      className={getChatContainerClasses()}
    >
      {/* Messages Window */}
      <div
        ref={scrollContainerRef}
        className={getChatLogClasses()}
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label={getChatLogAriaLabel(messages.length)}
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 my-auto">
            <p className="text-xs text-muted-foreground font-medium italic">
              {getChatEmptyStateText()}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === currentUserId || msg.alias === "Vos";
            const isSystem = msg.type === "system" || msg.userId === "system-bot";
            const msgAriaLabel = getChatMessageAriaLabel(msg, currentUserId);

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  role="article"
                  aria-label={msgAriaLabel}
                  className="flex flex-col items-center my-1.5 gap-1"
                >
                  <div className={getChatSystemMessageBubbleClasses()}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-medium text-muted-foreground/50" aria-hidden="true">
                    {formatChatTime(msg.ts)}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                role="article"
                aria-label={msgAriaLabel}
                className={cn("flex flex-col max-w-[75%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
              >
                <span className="text-[10px] font-bold text-muted-foreground mb-0.5 px-1 flex items-center gap-1.5" aria-hidden="true">
                  <span>{isMe ? "Vos" : msg.alias}</span>
                  <span className="font-normal text-muted-foreground/60">{formatChatTime(msg.ts)}</span>
                </span>
                <div
                  className={cn(
                    "rounded-xl px-3.5 py-2 text-sm leading-relaxed break-words shadow-xs font-medium",
                    getChatBubbleClasses(isMe),
                  )}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions bar */}
      <div
        className={getChatShortcutsBarClasses()}
        role="region"
        aria-label={getChatShortcutsRegionAriaLabel()}
      >
        <span className="text-[10px] font-bold text-muted-foreground/70 shrink-0 mr-0.5">
          {getChatShortcutsTitleText()}
        </span>
        {CHAT_QUICK_SUGGESTIONS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setInputText(chip.text)}
            className={getChatShortcutChipClasses()}
            aria-label={getQuickChipAriaLabel(chip.text)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className={getChatFormClasses()}
      >
        <div className="flex items-center gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && inputText) {
                e.preventDefault();
                setInputText("");
              }
            }}
            placeholder={getChatInputPlaceholderText()}
            maxLength={300}
            disabled={isSending}
            aria-busy={isSending}
            className={getChatInputClasses()}
            aria-label={getChatInputAriaLabel(isSending)}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputText.trim() || isSending}
            aria-busy={isSending}
            className={getChatSendButtonClasses()}
            aria-label={getChatSendButtonAriaLabel(isSending)}
          >
            {isSending ? (
              <Loader2 className={getChatSendSpinnerClasses()} aria-hidden="true" />
            ) : (
              <Send className={getChatSendIconClasses()} aria-hidden="true" />
            )}
          </Button>
        </div>
        {(inputText ?? "").length > 200 && (
          <div className="flex justify-end px-1">
            <span
              className={cn(
                "text-[11px] font-bold",
                getChatCounterTextClasses((inputText ?? "").length),
              )}
              aria-label={getChatCharacterCounterAriaLabel((inputText ?? "").length, 300)}
            >
              {(inputText ?? "").length}/300
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
