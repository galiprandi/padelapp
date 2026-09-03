"use client";

import { useCallback, useState, useEffect } from "react";
import { Share2, Check, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import { getNaturalShareText, type ShareDataPayload, cn } from "@/lib/utils";

interface ShareButtonProps extends ButtonProps {
  url: string;
  title?: string;
  text?: string;
  shareData?: ShareDataPayload;
  successMessage?: string;
  copyMessage?: string;
  errorMessage?: string;
  iconOnly?: boolean;
}

const DEFAULT_SUCCESS = "Compartido";
const DEFAULT_COPY = "Link copiado al portapapeles";
const DEFAULT_ERROR = "No pudimos compartir el link";

export function ShareButton({
  url: urlProp,
  title,
  text: textProp,
  shareData,
  successMessage,
  copyMessage,
  errorMessage,
  iconOnly,
  children,
  onClick,
  ...buttonProps
}: ShareButtonProps) {
  const { showToast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [url, setUrl] = useState(urlProp);
  const [text, setText] = useState<string | undefined>(textProp);

  // If shareData payload is provided, dynamically format the sharing text
  // so that it formats dates/times using the client browser timezone on mount.
  useEffect(() => {
    if (shareData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(getNaturalShareText(shareData));
    } else {
      setText(textProp);
    }
  }, [shareData, textProp]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const parsed = new URL(urlProp, window.location.origin);
        if (parsed.origin !== window.location.origin) {
          parsed.protocol = window.location.protocol;
          parsed.host = window.location.host;
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setUrl(parsed.toString());
        }
      } catch {
        setUrl(urlProp);
      }
    }
  }, [urlProp]);

  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => setIsSuccess(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess]);

  const { disabled, className, ...restButtonProps } = buttonProps;

  const handleShare = useCallback<NonNullable<ButtonProps["onClick"]>>(
    async (event) => {
      onClick?.(event);
      if (event.defaultPrevented) {
        return;
      }

      if (
        event.type === "click" &&
        event.nativeEvent instanceof MouseEvent &&
        event.nativeEvent.button !== 0
      ) {
        return;
      }

      setIsSharing(true);
      try {
        let shared = false;
        if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
          try {
            await navigator.share({ url, title, text });
            showToast(successMessage ?? DEFAULT_SUCCESS);
            shared = true;
          } catch (shareError) {
            if ((shareError as DOMException)?.name === "AbortError") {
              return;
            }
            // fall through to clipboard fallback
          }
        }

        if (
          !shared &&
          typeof navigator !== "undefined" &&
          navigator.clipboard &&
          typeof navigator.clipboard.writeText === "function"
        ) {
          await navigator.clipboard.writeText(url);
          showToast(copyMessage ?? DEFAULT_COPY);
          shared = true;
        }

        if (!shared) {
          const textarea = document.createElement("textarea");
          textarea.value = url;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "absolute";
          textarea.style.left = "-9999px";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
          showToast(copyMessage ?? DEFAULT_COPY);
          shared = true;
        }

        if (shared) {
          setIsSuccess(true);
        }
      } catch (error) {
        console.error("ShareButton failed", error);
        showToast(errorMessage ?? DEFAULT_ERROR);
      } finally {
        setIsSharing(false);
      }
    },
    [onClick, url, title, text, successMessage, copyMessage, errorMessage, showToast],
  );

  const dynamicAriaLabel = buttonProps["aria-label"]
    ? buttonProps["aria-label"]
    : iconOnly
      ? isSharing
        ? "Compartiendo..."
        : isSuccess
          ? (successMessage ?? DEFAULT_SUCCESS)
          : "Compartir"
      : undefined;

  return (
    <Button
      type="button"
      onClick={handleShare}
      disabled={isSharing || disabled}
      aria-busy={isSharing}
      aria-live="polite"
      aria-label={dynamicAriaLabel}
      className={cn(
        "active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        className,
      )}
      {...restButtonProps}
    >
      {iconOnly ? (
        isSharing ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : isSuccess ? (
          <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
        ) : (
          <Share2 className="h-4 w-4" aria-hidden="true" />
        )
      ) : (
        children ?? (
          <span className="flex items-center gap-2">
            {isSharing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : isSuccess ? (
              <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            ) : (
              <Share2 className="h-4 w-4" aria-hidden="true" />
            )}
            <span>
              {isSharing
                ? "Compartiendo..."
                : isSuccess
                  ? (successMessage ?? DEFAULT_SUCCESS)
                  : "Compartir"}
            </span>
          </span>
        )
      )}
    </Button>
  );
}
