"use client";

import { useTransition, useState } from "react";
import { Bell, Loader2, Check } from "lucide-react";
import { openToNetworkAction } from "@/app/(app)/turnos/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OpenToNetworkButtonProps {
  turnId: string;
  club: string;
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
        disabled={isPending}
        variant={variant}
        size={size}
        className={cn(
          variant === "default" && "font-bold",
          className
        )}
        aria-label={label}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bell className={cn("h-4 w-4", !isIconOnly && "mr-2")} />
        )}
        {!isIconOnly && (isPending ? "Enviando..." : label)}
      </Button>

      {error && !isIconOnly && (
        <p className="text-xs text-destructive font-semibold text-center">{error}</p>
      )}

      {showText && !isIconOnly && (
        <p className="text-xs text-muted-foreground text-center">
          Notifica a contactos de los últimos 12 meses
        </p>
      )}
    </div>
  );
}
