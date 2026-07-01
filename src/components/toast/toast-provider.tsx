"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastOptions {
  duration?: number;
  type?: "success" | "error";
}

interface ToastItem {
  id: number;
  message: string;
  options: ToastOptions;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    const id = Date.now();
    setToasts((previous) => [...previous, { id, message, options: options ?? {} }]);

    const duration = options?.duration ?? 2500;
    window.setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <div
              className="pointer-events-none fixed top-6 right-6 z-[60] flex flex-col items-end gap-3"
              role="status"
              aria-live="polite"
            >
              {toasts.map((toast) => {
                const isError = toast.options.type === "error";
                return (
                  <div
                    key={toast.id}
                    className={cn(
                      "pointer-events-auto flex items-center gap-3 rounded-[2rem] border bg-zinc-950/90 px-6 py-4 shadow-2xl backdrop-blur-2xl transition-all duration-500 animate-in fade-in slide-in-from-right-8",
                      isError
                        ? "border-destructive/40 text-destructive shadow-destructive/10"
                        : "border-primary/20 text-primary shadow-primary/20"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm",
                        isError ? "bg-destructive/20" : "bg-primary/20"
                      )}
                    >
                      {isError ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-none pt-0.5">
                      {toast.message}
                    </span>
                  </div>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
