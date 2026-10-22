"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, AlertCircle } from "lucide-react";
import type { ToastAction, ToastItem, ToastOptions } from "./toast-utils";
import {
  createToastItem,
  formatToastAriaLabel,
  getToastActionClasses,
  getToastAriaAttributes,
  getToastClasses,
  getToastContainerClasses,
  getToastDuration,
  getToastIconClasses,
  getToastIconSvgClasses,
  getToastMessageClasses,
  isErrorToast,
} from "./toast-utils";

export type { ToastAction, ToastItem, ToastOptions };

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = Date.now();
      const newToast = createToastItem(id, message, options);
      setToasts((previous) => [...previous, newToast]);

      const duration = getToastDuration(options);
      window.setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <div
              className={getToastContainerClasses()}
              {...getToastAriaAttributes()}
            >
              {toasts.map((toast) => {
                const isError = isErrorToast(toast.options.type);
                return (
                  <div
                    key={toast.id}
                    className={getToastClasses(toast.options.type)}
                    aria-label={formatToastAriaLabel(toast.message, toast.options.type)}
                  >
                    <div className={getToastIconClasses(toast.options.type)}>
                      {isError ? (
                        <AlertCircle className={getToastIconSvgClasses()} />
                      ) : (
                        <Check className={getToastIconSvgClasses()} />
                      )}
                    </div>
                    <span className={getToastMessageClasses()}>
                      {toast.message}
                    </span>
                    {toast.options.action && (
                      <button
                        onClick={() => {
                          toast.options.action!.onClick();
                          removeToast(toast.id);
                        }}
                        className={getToastActionClasses()}
                      >
                        {toast.options.action.label}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>,
            document.body
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
