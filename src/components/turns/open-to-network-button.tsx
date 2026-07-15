"use client";

import { useTransition, useState } from "react";
import { Bell, Loader2, Check } from "lucide-react";
import { openToNetworkAction } from "@/app/(app)/turnos/actions";

interface OpenToNetworkButtonProps {
  turnId: string;
  club: string;
}

export function OpenToNetworkButton({ turnId, club }: OpenToNetworkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    notified: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
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
    return (
      <div className="w-full rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-4 py-3 text-sm">
        <div className="flex items-center gap-2 text-emerald-600 font-bold">
          <Check className="h-4 w-4" />
          <span>
            {result.notified > 0
              ? `Se notificó a ${result.notified} contacto${result.notified === 1 ? "" : "s"} de ${result.total}`
              : "No se pudo enviar notificaciones (configurá Firebase)"}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Los jugadores de tu red recibirán una push para sumarse.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="w-full h-12 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {isPending ? "Enviando..." : "Abrir a mi red"}
      </button>
      {error && (
        <p className="text-xs text-destructive font-semibold">{error}</p>
      )}
      <p className="text-xs text-muted-foreground text-center">
        Notifica a jugadores con quienes compartiste cancha en los últimos 12 meses
      </p>
    </div>
  );
}
