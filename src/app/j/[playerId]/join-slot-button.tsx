"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinMatchPlayerAction } from "@/app/(app)/match/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import { Loader2 } from "lucide-react";
import {
  getJoinSlotButtonAriaLabel,
  getJoinSlotButtonText,
  getJoinSlotSuccessToast,
  getJoinSlotErrorToast,
} from "./join-slot-utils";

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
        showToast(getJoinSlotSuccessToast());
        router.push(redirectOnSuccess ?? `/match/${matchId}`);
        router.refresh();
      } else {
        showToast(getJoinSlotErrorToast(response.message));
      }
    });
  }

  return (
    <Button
      type="button"
      disabled={disabled || isPending}
      aria-busy={isPending}
      onClick={handleJoin}
      aria-label={getJoinSlotButtonAriaLabel(isPending)}
      className="w-full h-12 rounded-lg text-base font-bold active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
          {getJoinSlotButtonText(true)}
        </>
      ) : (
        getJoinSlotButtonText(false)
      )}
    </Button>
  );
}
