"use client";

import { useState, useTransition } from "react";
import { UserMinus, UserCheck, X, Loader2 } from "lucide-react";
import {
  removePlayerAction,
  assignSubstituteAction,
} from "@/app/(app)/turnos/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast/use-toast";
import {
  getRemovePlayerAriaLabel,
  getRemovePlayerCancelAriaLabel,
  getRemovePlayerRegionAriaLabel,
  getRemovePlayerSuccessToast,
  getRemovePlayerErrorToast,
  getRemovePlayerConfirmText,
  getAssignSubstituteAriaLabel,
  getAssignSubstituteRegionAriaLabel,
  getAssignSubstituteSuccessToast,
  getAssignSubstituteErrorToast,
  getAssignSubstituteButtonText,
  getRemovePlayerTriggerButtonClasses,
  getRemovePlayerConfirmButtonClasses,
  getRemovePlayerDismissButtonClasses,
  getAssignSubstituteButtonClasses,
  getRemovePlayerRegionContainerClasses,
  getRemovePlayerConfirmRegionClasses,
  getAssignSubstituteRegionContainerClasses,
} from "@/components/turns/turn-utils";

export function RemovePlayerButton({
  turnId,
  playerUserId,
  playerName,
}: {
  turnId: string;
  playerUserId: string;
  playerName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removePlayerAction(turnId, playerUserId);
      if (result.status === "ok") {
        showToast(getRemovePlayerSuccessToast(playerName));
      } else {
        showToast(getRemovePlayerErrorToast(result.message));
      }
      router.refresh();
    });
  };

  if (!confirming) {
    return (
      <div
        role="region"
        aria-label={getRemovePlayerRegionAriaLabel({ playerName, isConfirming: false })}
        className={getRemovePlayerRegionContainerClasses()}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConfirming(true);
          }}
          className={getRemovePlayerTriggerButtonClasses()}
          aria-label={getRemovePlayerAriaLabel({ playerName })}
        >
          <UserMinus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label={getRemovePlayerRegionAriaLabel({ playerName, isConfirming: true })}
      tabIndex={-1}
      className={getRemovePlayerConfirmRegionClasses()}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !isPending) {
          e.preventDefault();
          e.stopPropagation();
          setConfirming(false);
        }
      }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleRemove();
        }}
        disabled={isPending}
        aria-busy={isPending}
        className={getRemovePlayerConfirmButtonClasses()}
        aria-label={getRemovePlayerAriaLabel({
          playerName,
          isPending,
          isConfirming: true,
        })}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          getRemovePlayerConfirmText()
        )}
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirming(false);
        }}
        disabled={isPending}
        className={getRemovePlayerDismissButtonClasses()}
        aria-label={getRemovePlayerCancelAriaLabel(playerName)}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function AssignSubstituteButton({
  turnId,
  substituteUserId,
  substituteName,
}: {
  turnId: string;
  substituteUserId: string;
  substituteName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  const handleAssign = () => {
    startTransition(async () => {
      const result = await assignSubstituteAction(turnId, substituteUserId);
      if (result.status === "ok") {
        showToast(getAssignSubstituteSuccessToast(substituteName));
      } else {
        showToast(getAssignSubstituteErrorToast(result.message));
      }
      router.refresh();
    });
  };

  return (
    <div
      role="region"
      aria-label={getAssignSubstituteRegionAriaLabel(substituteName)}
      className={getAssignSubstituteRegionContainerClasses()}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAssign();
        }}
        disabled={isPending}
        aria-busy={isPending}
        className={getAssignSubstituteButtonClasses()}
        aria-label={getAssignSubstituteAriaLabel({
          substituteName,
          isPending,
        })}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <UserCheck className="h-3.5 w-3.5" />
        )}
        {getAssignSubstituteButtonText(isPending)}
      </button>
    </div>
  );
}
