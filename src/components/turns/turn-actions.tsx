"use client";

import { useTransition, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import {
  Trash2,
  Play,
  UserPlus,
  LogOut,
  CalendarPlus,
  Loader2,
  X,
} from "lucide-react";
import {
  cancelTurnAction,
  convertTurnToMatchAction,
  joinTurnAction,
  joinSubstituteAction,
  leaveSubstituteAction,
  takeOpenSlotAction,
  scheduleNextTurnAction,
  markTurnAsPlayedAction,
} from "@/app/(app)/turnos/actions";

export function CancelTurnForm({ turnId }: { turnId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await cancelTurnAction(turnId);
      if (result.status === "ok") {
        router.push("/turnos");
      }
    });
  };

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => setConfirming(true)}
        className="w-full h-10 rounded-lg text-xs font-bold text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Cancelar y eliminar este turno"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Eliminar
      </Button>
    );
  }

  return (
    <div className="flex-1 flex items-center gap-1.5">
      <Button
        type="button"
        variant="ghost"
        disabled={isPending}
        onClick={() => setConfirming(false)}
        className="h-10 px-2 rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Cancelar eliminación del turno"
      >
        <X className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={isPending}
        onClick={handleCancel}
        className="flex-1 h-10 rounded-lg text-xs font-bold text-destructive border border-destructive/20 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Confirmar eliminación del turno"
      >
        {isPending ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
        )}
        {isPending ? "Eliminando..." : "Confirmar"}
      </Button>
    </div>
  );
}

export function StartMatchForm({ turnId }: { turnId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await convertTurnToMatchAction(turnId);
      if (result.status === "ok" && result.matchId) {
        router.push(`/match/${result.matchId}`);
      }
    });
  };

  return (
    <form onSubmit={handleStart}>
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-lg text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Iniciar partido ahora"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Play className="mr-2 h-5 w-5 fill-current" />
        )}
        {isPending ? "Iniciando..." : "Iniciar partido"}
      </Button>
    </form>
  );
}

export function JoinTurnForm({ turnId }: { turnId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const autoJoinAttempted = useRef(false);

  const handleJoin = (e?: React.FormEvent) => {
    e?.preventDefault();
    startTransition(async () => {
      const result = await joinTurnAction(turnId);
      if (result.status === "ok") {
        showToast("Te sumaste al turno.");
        router.refresh();
      }
    });
  };

  // Auto-join when arriving from a push notification CTA (?join=1)
  useEffect(() => {
    if (autoJoinAttempted.current) return;
    if (searchParams.get("join") === "1") {
      autoJoinAttempted.current = true;
      handleJoin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <form onSubmit={handleJoin} className="w-full">
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-lg text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Sumarme al turno"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <UserPlus className="mr-2 h-5 w-5" />
        )}
        {isPending ? "Sumando..." : "Sumarme ahora"}
      </Button>
    </form>
  );
}

export function JoinSubstituteForm({ turnId }: { turnId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleJoinSubstitute = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await joinSubstituteAction(turnId);
      if (result.status === "ok") {
        showToast("Te sumaste como suplente. Te avisaremos cuando se libere un cupo.");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleJoinSubstitute} className="w-full">
      <Button
        type="submit"
        variant="outline"
        disabled={isPending}
        className="w-full h-12 rounded-lg text-base font-bold border-primary text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Sumarse como suplente"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <UserPlus className="mr-2 h-5 w-5" />
        )}
        {isPending ? "Sumando..." : "Sumarme como suplente"}
      </Button>
    </form>
  );
}

export function LeaveSubstituteForm({
  turnId,
  hasOpenSlot,
}: {
  turnId: string;
  hasOpenSlot?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLeaveSubstitute = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await leaveSubstituteAction(turnId);
      if (result.status === "ok") {
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleLeaveSubstitute}>
      <Button
        type="submit"
        variant="ghost"
        disabled={isPending}
        className="w-full h-10 rounded-lg text-xs font-bold text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Salir de la lista de suplentes"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="mr-2 h-4 w-4" />
        )}
        {isPending
          ? "Saliendo..."
          : hasOpenSlot
            ? "No puedo — salir de suplentes"
            : "Salir de suplentes"}
      </Button>
    </form>
  );
}

export function TakeOpenSlotForm({ turnId }: { turnId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleTakeSlot = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await takeOpenSlotAction(turnId);
      if (result.status === "ok") {
        showToast("Ocupaste el cupo.");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleTakeSlot} className="w-full">
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-lg text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Ocupar el cupo libre disponible"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Play className="mr-2 h-5 w-5 fill-current" />
        )}
        {isPending ? "Ocupando..." : "Ocupar cupo"}
      </Button>
    </form>
  );
}

export function ScheduleNextTurnForm({ turnId }: { turnId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleScheduleNext = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await scheduleNextTurnAction(turnId);
      if (result.status === "ok" && result.turnId) {
        router.push(`/t/${result.turnId}`);
      }
    });
  };

  return (
    <form onSubmit={handleScheduleNext}>
      <Button
        type="submit"
        variant="outline"
        disabled={isPending}
        className="w-full h-10 rounded-lg text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Programar el próximo turno para la siguiente semana"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CalendarPlus className="mr-2 h-4 w-4" />
        )}
        {isPending ? "Programando..." : "Programar próximo turno"}
      </Button>
    </form>
  );
}

export function PlayCasualForm({ turnId }: { turnId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handlePlayCasual = () => {
    startTransition(async () => {
      const result = await markTurnAsPlayedAction(turnId);
      if (result.status === "ok") {
        showToast("Marcaste el turno como jugado.");
        router.push("/turnos");
      } else {
        showToast(result.message ?? "No se pudo marcar el turno como jugado.");
      }
    });
  };

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setConfirming(true)}
        className="w-full h-12 rounded-lg text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Marcar turno como jugado sin registrar partido"
      >
        <Play className="mr-2 h-5 w-5" />
        Jugar igual
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted p-3">
      <p className="text-xs text-muted-foreground text-center">
        ¿Marcar como jugado? <strong className="text-foreground">Se cerrará el turno</strong> sin registrar un partido ni resultados en el ranking.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => setConfirming(false)}
          variant="outline"
          disabled={isPending}
          className="flex-1 h-10 rounded-lg text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handlePlayCasual}
          variant="default"
          disabled={isPending}
          className="flex-1 h-10 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
          aria-label="Confirmar marcar como jugado"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4 fill-current" />
          )}
          {isPending ? "Marcando..." : "Confirmar"}
        </Button>
      </div>
    </div>
  );
}
