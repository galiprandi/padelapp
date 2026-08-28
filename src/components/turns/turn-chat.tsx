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
import { formatChatTime, CHAT_QUICK_SUGGESTIONS } from "./turn-chat-utils";

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
    const cleanText = inputText.trim();
    if (!cleanText || isSending) return;

    if (cleanText.length > 300) {
      showToast("El mensaje es demasiado largo (máximo 300 caracteres)");
      return;
    }

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
        showToast(res.message ?? "No se pudo enviar el mensaje");
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
      <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">
            Cargando chat del turno...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
      {/* Messages Window */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72 min-h-[18rem] bg-card"
        role="log"
        aria-label="Historial del chat del turno"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 my-auto">
            <p className="text-xs text-muted-foreground font-medium italic">
              No hay mensajes todavía. Escribí el primero para organizar.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === currentUserId || msg.alias === "Vos";
            const isSystem = msg.type === "system" || msg.userId === "system-bot";

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  className="flex flex-col items-center my-1.5 gap-1"
                >
                  <div className="rounded-lg bg-muted px-3 py-1.5 border border-border text-[11px] font-semibold text-muted-foreground text-center max-w-[85%] leading-normal">
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-medium text-muted-foreground/50">
                    {formatChatTime(msg.ts)}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={cn("flex flex-col max-w-[75%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
              >
                <span className="text-[10px] font-bold text-muted-foreground mb-0.5 px-1 flex items-center gap-1.5">
                  <span>{isMe ? "Vos" : msg.alias}</span>
                  <span className="font-normal text-muted-foreground/60">{formatChatTime(msg.ts)}</span>
                </span>
                <div
                  className={cn(
                    "rounded-xl px-3.5 py-2 text-sm leading-relaxed break-words shadow-sm font-medium",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted text-foreground border border-border rounded-tl-none",
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
        className="px-3 py-2 bg-muted/60 border-t border-border flex items-center gap-1.5 overflow-x-auto scrollbar-none"
        role="region"
        aria-label="Atajos de mensajes rápidos"
      >
        <span className="text-[10px] font-bold text-muted-foreground/70 shrink-0 mr-0.5">
          Atajos:
        </span>
        {CHAT_QUICK_SUGGESTIONS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setInputText(chip.text)}
            className="rounded-full bg-card hover:bg-muted border border-border px-2.5 py-1 text-xs font-semibold text-foreground transition-all shrink-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            aria-label={`Usar atajo ${chip.text}`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="border-t border-border p-3 bg-muted flex flex-col gap-1.5"
      >
        <div className="flex items-center gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribí un mensaje..."
            maxLength={300}
            disabled={isSending}
            className="h-10 rounded-lg bg-card border-border placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:ring-offset-1 text-sm flex-1"
            aria-label="Escribir mensaje"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputText.trim() || isSending}
            className="h-10 w-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 focus-visible:ring-ring active:scale-[0.98] transition-all"
            aria-label="Enviar mensaje"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {(inputText ?? "").length > 200 && (
          <div className="flex justify-end px-1">
            <span
              className={cn(
                "text-[11px] font-bold",
                (inputText ?? "").length >= 290
                  ? "text-destructive"
                  : (inputText ?? "").length >= 250
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground",
              )}
              aria-hidden="true"
            >
              {(inputText ?? "").length}/300
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
