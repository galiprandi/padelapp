"use client";

import { useTransition } from "react";
import { finalizeMatchAction } from "../actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";

interface FinalizeMatchButtonProps {
  matchId: string;
  disabled?: boolean;
}

export function FinalizeMatchButton({ matchId, disabled }: FinalizeMatchButtonProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const response = await finalizeMatchAction(matchId);
      if (response.status === "ok") {
        showToast("Partido finalizado");
      } else {
        showToast(response.message ?? "No pudimos finalizar el partido.");
      }
    });
  }

  return (
    <Button type="button" variant="secondary" onClick={handleClick} disabled={disabled || isPending}>
      {isPending ? "Finalizando..." : "Finalizar partido"}
    </Button>
  );
}
