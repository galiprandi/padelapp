"use client";

import { useTransition } from "react";
import { confirmMatchResultAction } from "../actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";

interface ConfirmResultButtonProps {
  matchId: string;
  disabled?: boolean;
  alreadyConfirmed?: boolean;
}

export function ConfirmResultButton({ matchId, disabled, alreadyConfirmed }: ConfirmResultButtonProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (alreadyConfirmed) {
      showToast("Ya confirmaste este resultado.");
      return;
    }

    startTransition(async () => {
      const response = await confirmMatchResultAction(matchId);
      if (response.status === "ok") {
        showToast("Resultado confirmado.");
      } else {
        showToast(response.message ?? "No pudimos confirmar el resultado.");
      }
    });
  }

  return (
    <Button type="button" variant="secondary" onClick={handleClick} disabled={disabled || isPending}>
      {isPending ? "Confirmando..." : "Confirmar resultado"}
    </Button>
  );
}
