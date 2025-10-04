"use client";

import { useCallback, useState } from "react";
import { Share2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";

interface ShareButtonProps extends ButtonProps {
  url: string;
  title?: string;
  text?: string;
  successMessage?: string;
  copyMessage?: string;
  errorMessage?: string;
  iconOnly?: boolean;
}

const DEFAULT_SUCCESS = "Compartido";
const DEFAULT_COPY = "Link copiado al portapapeles";
const DEFAULT_ERROR = "No pudimos compartir el link";

export function ShareButton({
  url,
  title,
  text,
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

  const { disabled, ...restButtonProps } = buttonProps;

  const handleShare = useCallback<NonNullable<ButtonProps["onClick"]>>(
    async (event) => {
      onClick?.(event);
      if (event.defaultPrevented) {
        return;
      }

      if (event.type === "click" && event.nativeEvent instanceof MouseEvent && event.nativeEvent.button !== 0) {
        return;
      }

      setIsSharing(true);
      try {
        if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
          try {
            await navigator.share({ url, title, text });
            showToast(successMessage ?? DEFAULT_SUCCESS);
            return;
          } catch (shareError) {
            if ((shareError as DOMException)?.name === "AbortError") {
              return;
            }
            // fall through to clipboard fallback
          }
        }

        if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          await navigator.clipboard.writeText(url);
          showToast(copyMessage ?? DEFAULT_COPY);
          return;
        }

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
      } catch (error) {
        console.error("ShareButton failed", error);
        showToast(errorMessage ?? DEFAULT_ERROR);
      } finally {
        setIsSharing(false);
      }
    },
    [onClick, url, title, text, successMessage, copyMessage, errorMessage, showToast],
  );

  return (
    <Button type="button" onClick={handleShare} disabled={isSharing || disabled} {...restButtonProps}>
      {iconOnly ? <Share2 className="h-4 w-4" /> : children ?? (
        <span className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          <span>Compartir</span>
        </span>
      )}
    </Button>
  );
}
