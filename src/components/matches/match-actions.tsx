"use client";

import { useTransition, useState, useEffect } from "react";
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
import {
  getCancelMatchAriaLabel,
  getCancelMatchConfirmRegionAriaLabel,
  getCancelMatchCancelAriaLabel,
  getCancelMatchSubmitAriaLabel,
  getCancelMatchSuccessToast,
  getCancelMatchErrorToast,
  getConfirmResultRegionAriaLabel,
  getConfirmResultAriaLabel,
  getConfirmResultSuccessToast,
  getConfirmResultErrorToast,
  getFinalizeMatchRegionAriaLabel,
  getFinalizeMatchAriaLabel,
  getFinalizeMatchSuccessToast,
  getFinalizeMatchErrorToast,
} from "./match-actions-utils";

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
        showToast(getCancelMatchSuccessToast());
        router.push("/match");
      } else {
        showToast(getCancelMatchErrorToast(result.message), { type: "error" });
      }
    });
  };

  useEffect(() => {
    if (!confirming) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirming(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirming]);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => setConfirming(true)}
        className="w-full h-10 rounded-lg text-xs font-bold text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all shadow-xs"
        aria-label={getCancelMatchAriaLabel()}
      >
        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
        Eliminar Partido
      </Button>
    );
  }

  return (
    <div
      role="region"
      aria-label={getCancelMatchConfirmRegionAriaLabel()}
      className="flex-1 flex items-center gap-1.5"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setConfirming(false);
        }
      }}
    >
      <Button
        type="button"
        variant="ghost"
        disabled={isPending}
        onClick={() => setConfirming(false)}
        className="h-10 px-2 rounded-lg text-xs font-bold text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all shadow-xs"
        aria-label={getCancelMatchCancelAriaLabel()}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={isPending}
        aria-busy={isPending}
        onClick={handleCancel}
        className="flex-1 h-10 rounded-lg text-xs font-bold text-destructive border border-destructive/20 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all shadow-xs"
        aria-label={getCancelMatchSubmitAriaLabel(isPending)}
      >
        {isPending ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
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
        showToast(getConfirmResultSuccessToast(), { type: "success" });
        router.refresh();
      } else {
        showToast(getConfirmResultErrorToast(res.message), { type: "error" });
      }
    });
  };

  return (
    <form
      onSubmit={handleConfirm}
      role="region"
      aria-label={getConfirmResultRegionAriaLabel()}
      className="w-full"
    >
      <Button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="w-full h-12 rounded-lg text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all shadow-xs"
        aria-label={getConfirmResultAriaLabel(isPending)}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="mr-2 h-5 w-5" aria-hidden="true" />
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
        showToast(getFinalizeMatchSuccessToast(), { type: "success" });
        router.refresh();
      } else {
        showToast(getFinalizeMatchErrorToast(res.message), { type: "error" });
      }
    });
  };

  return (
    <form
      onSubmit={handleFinalize}
      role="region"
      aria-label={getFinalizeMatchRegionAriaLabel()}
      className="w-full"
    >
      <Button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        variant="outline"
        className="w-full h-10 border-border bg-card text-foreground font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98] transition-all shadow-xs"
        aria-label={getFinalizeMatchAriaLabel(isPending)}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="mr-2 h-4 w-4 text-primary" aria-hidden="true" />
        )}
        {isPending ? "Finalizando..." : "Finalizar como Organizador"}
      </Button>
    </form>
  );
}
