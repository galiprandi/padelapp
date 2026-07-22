"use client";

import { useTransition, useState, useEffect } from "react";
import { Bell, Loader2, Check, BellOff } from "lucide-react";
import { openToNetworkAction } from "@/app/(app)/turnos/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OpenToNetworkButtonProps {
  turnId: string;
  club: string;
  lastNetworkNotificationAt?: Date | null;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
  label?: string;
  iconOnly?: boolean;
}

export function OpenToNetworkButton({
  turnId,
  club,
  lastNetworkNotificationAt,
  variant = "default",
  size = "default",
  className,
  showText = true,
  label = "Abrir a mi red",
  iconOnly = false,
}: OpenToNetworkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    notified: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [minutesRemaining, setMinutesRemaining] = useState<number>(0);

  useEffect(() => {
    if (!lastNetworkNotificationAt) {
      setMinutesRemaining(0);
      return;
    }

    const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
    const updateCountdown = () => {
      const notifiedTime = new Date(lastNetworkNotificationAt).getTime();
      const diff = Date.now() - notifiedTime;
      if (diff < COOLDOWN_MS) {
        setMinutesRemaining(Math.ceil((COOLDOWN_MS - diff) / (60 * 1000)));
      } else {
        setMinutesRemaining(0);
      }
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
        setResult({
          notified: res.notifiedCount ?? 0,
          total: res.totalContacts ?? 0,
        });
      } else {
        setError(res.message ?? "Error al abrir el turno a tu red");
      }
    });
  };

  if (result) {
    if (iconOnly || size === "icon") {
      return (
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm", className)}>
          <Check className="h-5 w-5" />
        </div>
      );
    }
    return (
      <div className={cn("w-full rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-4 py-3 text-sm", className)}>
        <div className="flex items-center gap-2 text-emerald-600 font-bold">
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

  return (
    <div className={cn("flex flex-col gap-2", !showText && "gap-0", isIconOnly && "gap-0")}>
      <Button
        onClick={handleClick}
        disabled={isPending || isOnCooldown}
        variant={isOnCooldown ? "outline" : variant}
        size={size}
        className={cn(
          variant === "default" && !isOnCooldown && "font-bold",
          isOnCooldown && "text-muted-foreground border-border bg-muted/20 cursor-not-allowed",
          className
        )}
        aria-label={isOnCooldown ? `Notificado, en cooldown por ${minutesRemaining} minutos` : label}
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
        <p className="text-xs text-destructive font-semibold text-center">{error}</p>
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
