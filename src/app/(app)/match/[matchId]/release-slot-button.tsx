"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { releaseMatchSlotAction } from "../actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";

interface ReleaseSlotButtonProps {
  playerId: string;
  displayName?: string | null;
}

export function ReleaseSlotButton({ playerId, displayName }: ReleaseSlotButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleRelease() {
    startTransition(async () => {
      const response = await releaseMatchSlotAction({
        playerId,
        displayName: displayName ?? null,
      });

      if (response.status === "ok") {
        showToast("Cupo liberado.");
        router.refresh();
      } else {
        showToast(response.message ?? "No pudimos liberar el cupo.");
      }
    });
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleRelease} disabled={isPending}>
      {isPending ? "Liberando..." : "Liberar cupo"}
    </Button>
  );
}
