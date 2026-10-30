"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2, Check, BellOff } from "lucide-react";
import { openToNetworkAction } from "@/app/(app)/turnos/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import { cn } from "@/lib/utils";
import {
  getCooldownRemainingMinutes,
  getOpenToNetworkSuccessToast,
  getOpenToNetworkErrorToast,
  getOpenToNetworkRegionAriaLabel,
  getOpenToNetworkResultText,
  getOpenToNetworkAriaLabel,
  getOpenToNetworkButtonText,
  getOpenToNetworkResultAriaLabel,
  getOpenToNetworkHelperText,
  getOpenToNetworkResultSubtitle,
  getOpenToNetworkResultDescription,
  getOpenToNetworkIconResultClasses,
  getOpenToNetworkCompactResultClasses,
  getOpenToNetworkDefaultResultClasses,
  getOpenToNetworkContainerClasses,
  getOpenToNetworkButtonClasses,
  getOpenToNetworkDefaultResultHeaderClasses,
  getOpenToNetworkDefaultResultDescriptionClasses,
  getOpenToNetworkErrorClasses,
  getOpenToNetworkHelperClasses,
} from "@/components/turns/turn-utils";

interface OpenToNetworkButtonProps {
  turnId: string;
  club: string;
  lastNetworkNotificationAt?: Date | string | null;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
  label?: string;
  iconOnly?: boolean;
}

export function OpenToNetworkButton({
  turnId,
  lastNetworkNotificationAt,
  variant = "default",
  size = "default",
  className,
  showText = true,
  label = "Abrir a mi red",
  iconOnly = false,
}: OpenToNetworkButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    notified: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [minutesRemaining, setMinutesRemaining] = useState<number>(0);

  useEffect(() => {
    if (!lastNetworkNotificationAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMinutesRemaining(0);
      return;
    }

    const updateCountdown = () => {
      setMinutesRemaining(getCooldownRemainingMinutes(lastNetworkNotificationAt));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [lastNetworkNotificationAt]);

  const isOnCooldown = minutesRemaining > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setError(null);
    setResult(null);

    startTransition(async () => {
      const res = await openToNetworkAction(turnId);
      if (res.status === "ok") {
        const notified = res.notifiedCount ?? 0;
        setResult({
          notified,
          total: res.totalContacts ?? 0,
        });
        showToast(getOpenToNetworkSuccessToast(notified));
        router.refresh();
      } else {
        const errMsg = getOpenToNetworkErrorToast(res.message);
        setError(errMsg);
        showToast(errMsg);
      }
    });
  };

  if (result) {
    const resultText = getOpenToNetworkResultText(result.notified);
    const resultAriaLabel = getOpenToNetworkResultAriaLabel(result.notified);

    if (iconOnly || size === "icon") {
      return (
        <div
          role="status"
          aria-live="polite"
          aria-label={resultAriaLabel}
          className={getOpenToNetworkIconResultClasses(className)}
        >
          <Check className="h-5 w-5" />
        </div>
      );
    }
    if (size === "sm" || !showText) {
      return (
        <div
          role="status"
          aria-live="polite"
          aria-label={resultAriaLabel}
          className={getOpenToNetworkCompactResultClasses(className)}
        >
          <Check className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {resultText}
          </span>
        </div>
      );
    }
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={resultAriaLabel}
        className={getOpenToNetworkDefaultResultClasses(className)}
      >
        <div className={getOpenToNetworkDefaultResultHeaderClasses()}>
          <Check className="h-4 w-4" />
          <span>
            {getOpenToNetworkResultSubtitle(result.notified)}
          </span>
        </div>
        {showText && (
          <p className={getOpenToNetworkDefaultResultDescriptionClasses()}>
            {getOpenToNetworkResultDescription()}
          </p>
        )}
      </div>
    );
  }

  const buttonText = getOpenToNetworkButtonText({
    isPending,
    isOnCooldown,
    minutesRemaining,
    label,
  });

  const isIconOnly = iconOnly || size === "icon";
  const computedAriaLabel = getOpenToNetworkAriaLabel({
    isPending,
    isOnCooldown,
    minutesRemaining,
    label,
  });

  return (
    <div
      role="region"
      aria-label={getOpenToNetworkRegionAriaLabel()}
      className={getOpenToNetworkContainerClasses(showText, isIconOnly)}
    >
      <Button
        onClick={handleClick}
        disabled={isPending || isOnCooldown}
        variant={isOnCooldown ? "outline" : variant}
        size={size}
        className={getOpenToNetworkButtonClasses({ isIconOnly, variant, isOnCooldown, className })}
        aria-busy={isPending}
        aria-label={computedAriaLabel}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isOnCooldown ? (
          <BellOff className={cn("h-4 w-4", !isIconOnly && "mr-2 text-muted-foreground/80")} />
        ) : (
          <Bell className={cn("h-4 w-4", !isIconOnly && "mr-2")} />
        )}
        {!isIconOnly && buttonText}
      </Button>

      {error && !isIconOnly && (
        <p role="alert" aria-live="assertive" className={getOpenToNetworkErrorClasses()}>{error}</p>
      )}

      {showText && !isIconOnly && (
        <p className={getOpenToNetworkHelperClasses()}>
          {getOpenToNetworkHelperText(isOnCooldown, minutesRemaining)}
        </p>
      )}
    </div>
  );
}
