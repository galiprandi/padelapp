"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinMatchPlayerAction } from "@/app/(app)/match/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import { Loader2 } from "lucide-react";

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
    <Button
      type="button"
      disabled={disabled || isPending}
      onClick={handleJoin}
      aria-label="Confirmar mi lugar en el partido"
      className="w-full h-12 rounded-lg text-base font-bold active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
          Confirmando...
        </>
      ) : (
        "Confirmar mi lugar"
      )}
    </Button>
  );
}
