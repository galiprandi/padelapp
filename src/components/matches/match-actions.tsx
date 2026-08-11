"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import {
  Trash2,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import {
  cancelMatchAction,
  confirmMatchResultAction,
  finalizeMatchAction,
} from "@/app/(app)/match/actions";

export function CancelMatchForm({ matchId }: { matchId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await cancelMatchAction(matchId);
      if (result.status === "ok") {
        showToast("Partido eliminado con éxito.");
        router.push("/match");
      } else {
        showToast(result.message || "No se pudo eliminar el partido.", { type: "error" });
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
        aria-label="Eliminar este partido"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Eliminar Partido
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
        aria-label="Cancelar eliminación del partido"
      >
        <X className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={isPending}
        onClick={handleCancel}
        className="flex-1 h-10 rounded-lg text-xs font-bold text-destructive border border-destructive/20 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Confirmar eliminación del partido"
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

export function ConfirmResultForm({ matchId }: { matchId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await confirmMatchResultAction(matchId);
      if (res.status === "ok") {
        showToast("Resultado confirmado 🏆", { type: "success" });
        router.refresh();
      } else {
        showToast(res.message || "No se pudo confirmar el resultado.", { type: "error" });
      }
    });
  };

  return (
    <form onSubmit={handleConfirm} className="w-full">
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-lg text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Confirmar resultado del partido"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-5 w-5" />
        )}
        {isPending ? "Confirmando..." : "Confirmar Resultado"}
      </Button>
    </form>
  );
}

export function FinalizeMatchForm({ matchId }: { matchId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await finalizeMatchAction(matchId);
      if (res.status === "ok") {
        showToast("Partido finalizado con éxito 🏆", { type: "success" });
        router.refresh();
      } else {
        showToast(res.message || "No se pudo finalizar el partido.", { type: "error" });
      }
    });
  };

  return (
    <form onSubmit={handleFinalize} className="w-full">
      <Button
        type="submit"
        disabled={isPending}
        variant="outline"
        className="w-full h-10 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]"
        aria-label="Finalizar el partido como organizador"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-4 w-4" />
        )}
        {isPending ? "Finalizando..." : "Finalizar como Organizador"}
      </Button>
    </form>
  );
}
