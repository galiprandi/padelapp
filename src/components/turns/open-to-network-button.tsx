"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2, Check, BellOff } from "lucide-react";
import { openToNetworkAction } from "@/app/(app)/turnos/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import { cn } from "@/lib/utils";
import { getCooldownRemainingMinutes } from "@/components/turns/turn-utils";

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
        showToast(
          notified > 0
            ? `Se notificó a ${notified} contacto${notified === 1 ? "" : "s"} de tu red.`
            : "Se avisó a tu red."
        );
        router.refresh();
      } else {
        const errMsg = res.message ?? "No se pudo notificar a tu red.";
        setError(errMsg);
        showToast(errMsg);
      }
    });
  };

  if (result) {
    const resultText =
      result.notified > 0
        ? `Se notificó a ${result.notified} contacto${result.notified === 1 ? "" : "s"}`
        : "Red notificada";

    if (iconOnly || size === "icon") {
      return (
        <div
          role="status"
          aria-live="polite"
          aria-label={resultText}
          className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm", className)}
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
          className={cn("flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-100 px-3 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200", className)}
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
        className={cn("w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm", className)}
      >
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
          <Check className="h-4 w-4" />
          <span>
            {result.notified > 0
              ? `Se notificó a ${result.notified} contacto${result.notified === 1 ? "" : "s"}`
              : "Sin contactos"}
          </span>
        </div>
        {showText && (
          <p className="mt-1 text-xs text-muted-foreground">
            Recibirán una push para sumarse.
          </p>
        )}
      </div>
    );
  }

  const isIconOnly = iconOnly || size === "icon";
  const cooldownAriaLabel = `Notificado, en cooldown por ${minutesRemaining} minuto${minutesRemaining === 1 ? "" : "s"}`;
  const computedAriaLabel = isPending
    ? "Notificando a tu red de pádel..."
    : isOnCooldown
    ? cooldownAriaLabel
    : label;

  return (
    <div className={cn("flex flex-col gap-2", !showText && "gap-0", isIconOnly && "gap-0")}>
      <Button
        onClick={handleClick}
        disabled={isPending || isOnCooldown}
        variant={isOnCooldown ? "outline" : variant}
        size={size}
        className={cn(
          !isIconOnly && "w-full",
          variant === "default" && !isOnCooldown && "font-bold",
          isOnCooldown && "text-muted-foreground border-border bg-muted cursor-not-allowed",
          "transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
          className,
        )}
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
        {!isIconOnly && (isPending ? "Enviando..." : isOnCooldown ? `Red notificada (esperá ${minutesRemaining} min)` : label)}
      </Button>

      {error && !isIconOnly && (
        <p role="alert" aria-live="assertive" className="text-xs text-destructive font-semibold text-center">{error}</p>
      )}

      {showText && !isIconOnly && (
        <p className="text-xs text-muted-foreground text-center font-medium">
          {isOnCooldown
            ? `Ya se notificó a la red. Podés volver a enviar en ${minutesRemaining} min.`
            : "Notifica a contactos de los últimos 12 meses"
          }
        </p>
      )}
    </div>
  );
}
