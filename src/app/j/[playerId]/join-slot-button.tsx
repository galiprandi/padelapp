"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinMatchPlayerAction } from "@/app/(app)/match/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";

interface JoinSlotButtonProps {
  playerId: string;
  matchId: string;
  disabled?: boolean;
  redirectOnSuccess?: string;
}

export function JoinSlotButton({ playerId, matchId, disabled, redirectOnSuccess }: JoinSlotButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleJoin() {
    startTransition(async () => {
      const response = await joinMatchPlayerAction(playerId);
      if (response.status === "ok") {
        showToast("Te sumaste al partido.");
        router.push(redirectOnSuccess ?? `/match/${matchId}`);
        router.refresh();
      } else {
        showToast(response.message ?? "No pudimos sumarte al partido.");
      }
    });
  }

  return (
    <Button type="button" className="w-full" disabled={disabled || isPending} onClick={handleJoin}>
      {isPending ? "Confirmando..." : "Confirmar mi lugar"}
    </Button>
  );
}
