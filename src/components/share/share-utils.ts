import { cn } from "@/lib/utils";

export const DEFAULT_SHARE_SUCCESS = "Compartido";
export const DEFAULT_SHARE_COPY = "Link copiado al portapapeles";
export const DEFAULT_SHARE_ERROR = "No pudimos compartir el link";

export interface ShareToastMessages {
  successMessage: string;
  copyMessage: string;
  errorMessage: string;
}

export function getShareToastMessages(options?: {
  successMessage?: string;
  copyMessage?: string;
  errorMessage?: string;
}): ShareToastMessages {
  return {
    successMessage: options?.successMessage ?? DEFAULT_SHARE_SUCCESS,
    copyMessage: options?.copyMessage ?? DEFAULT_SHARE_COPY,
    errorMessage: options?.errorMessage ?? DEFAULT_SHARE_ERROR,
  };
}

export function getShareButtonLabel(options: {
  isSharing?: boolean;
  isSuccess?: boolean;
  successMessage?: string;
}): string {
  if (options.isSharing) {
    return "Compartiendo...";
  }
  if (options.isSuccess) {
    return options.successMessage ?? DEFAULT_SHARE_SUCCESS;
  }
  return "Compartir";
}

export function getShareButtonAriaLabel(options: {
  customAriaLabel?: string;
  iconOnly?: boolean;
  isSharing?: boolean;
  isSuccess?: boolean;
  successMessage?: string;
}): string | undefined {
  if (options.customAriaLabel) {
    return options.customAriaLabel;
  }
  if (options.iconOnly) {
    return getShareButtonLabel(options);
  }
  return undefined;
}

export function formatShareUrl(
  urlProp: string,
  origin?: string,
  protocol?: string,
  host?: string,
): string {
  if (!origin) {
    return urlProp;
  }

  try {
    const parsed = new URL(urlProp, origin);
    if (parsed.origin !== origin) {
      if (protocol) {
        parsed.protocol = protocol;
      }
      if (host) {
        parsed.host = host;
      }
      return parsed.toString();
    }
    return parsed.toString();
  } catch {
    return urlProp;
  }
}

/**
 * Returns standardized CSS classes for the share button trigger.
 */
export function getShareButtonClasses(className?: string): string {
  return cn(
    "active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
    className,
  );
}

/**
 * Returns standardized CSS classes for the loading spinner inside share buttons.
 */
export function getShareSpinnerClasses(): string {
  return "h-4 w-4 animate-spin text-muted-foreground";
}

/**
 * Returns standardized CSS classes for the checkmark success icon inside share buttons.
 */
export function getShareCheckIconClasses(): string {
  return "h-4 w-4 text-emerald-500";
}

/**
 * Returns standardized CSS classes for default share icon.
 */
export function getShareIconClasses(): string {
  return "h-4 w-4";
}

/**
 * Returns standardized CSS layout classes for share button label and icon content.
 */
export function getShareContentClasses(): string {
  return "flex items-center gap-2";
}
