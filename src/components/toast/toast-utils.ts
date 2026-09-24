import { cn } from "@/lib/utils";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  duration?: number;
  type?: "success" | "error";
  action?: ToastAction;
}

export interface ToastItem {
  id: number;
  message: string;
  options: ToastOptions;
}

export const DEFAULT_TOAST_DURATION = 2500;

export function getToastDuration(options?: ToastOptions): number {
  return options?.duration ?? DEFAULT_TOAST_DURATION;
}

export function isErrorToast(type?: "success" | "error"): boolean {
  return type === "error";
}

export function getToastContainerClasses(): string {
  return "pointer-events-none fixed top-6 right-6 z-[60] flex flex-col items-end gap-3";
}

export function getToastClasses(type?: "success" | "error"): string {
  const isError = isErrorToast(type);
  return cn(
    "pointer-events-auto flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm transition-opacity",
    isError
      ? "border-destructive text-destructive"
      : "border-primary text-primary"
  );
}

export function getToastIconClasses(type?: "success" | "error"): string {
  const isError = isErrorToast(type);
  return cn(
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm",
    isError ? "bg-destructive/10" : "bg-primary/10"
  );
}

export function getToastActionClasses(): string {
  return "text-xs font-bold underline underline-offset-2 hover:no-underline rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all";
}

export function getToastAriaAttributes(): { role: "status"; "aria-live": "polite" } {
  return {
    role: "status",
    "aria-live": "polite",
  };
}

export function formatToastAriaLabel(message: string, type?: "success" | "error"): string {
  const isError = isErrorToast(type);
  return `${isError ? "Notificación de error" : "Notificación de éxito"}: ${message}`;
}

export function createToastItem(
  id: number,
  message: string,
  options?: ToastOptions
): ToastItem {
  return {
    id,
    message,
    options: options ?? {},
  };
}
