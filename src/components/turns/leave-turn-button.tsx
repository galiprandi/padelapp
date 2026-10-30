"use client";

import { useState, useTransition } from "react";
import { LogOut, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share/share-button";
import { createMagicLink } from "@/lib/magic-link";
import { leaveTurnAction } from "@/app/(app)/turnos/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast/use-toast";
import {
  isLateLeaveWarningRequired,
  getLeaveTurnSuccessToast,
  getLeaveTurnErrorToast,
  getLeaveTurnTriggerAriaLabel,
  getLeaveTurnRegionAriaLabel,
  getCancelLeaveTurnAriaLabel,
  getConfirmLeaveTurnAriaLabel,
  getLateLeaveWarningTitle,
  getLateLeaveWarningDescription,
  getWasFullSharePromptText,
  getLeaveTurnTriggerButtonText,
  getConfirmLeaveButtonText,
  getLeaveTurnCancelButtonText,
  getWasFullShareTitle,
  getWasFullShareText,
  getLeaveTurnTriggerButtonClasses,
  getLeaveTurnLateLeaveCardClasses,
  getLeaveTurnWasFullCardClasses,
  getLeaveTurnCancelButtonClasses,
  getLeaveTurnConfirmButtonClasses,
  getLeaveTurnWasFullShareButtonClasses,
  getLeaveTurnConfirmContainerClasses,
  getLeaveTurnLateLeaveTitleClasses,
  getLeaveTurnLateLeaveDotClasses,
  getLeaveTurnLateLeaveDescriptionClasses,
  getLeaveTurnWasFullPromptClasses,
  getLeaveTurnActionGroupClasses,
} from "@/components/turns/turn-utils";

interface LeaveTurnButtonProps {
  turnId: string;
  club: string;
  wasFull?: boolean;
  isCreator?: boolean;
  date: Date | string;
}

export function LeaveTurnButton({
  turnId,
  club,
  wasFull,
  isCreator = false,
  date,
}: LeaveTurnButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  const handleLeave = () => {
    startTransition(async () => {
      const result = await leaveTurnAction(turnId);
      if (result.status === "ok") {
        showToast(getLeaveTurnSuccessToast());
      } else {
        showToast(getLeaveTurnErrorToast(result.message));
      }
      router.refresh();
    });
  };

  const isLateLeave = isLateLeaveWarningRequired({ date, isCreator });

  if (!confirming) {
    return (
      <Button
        onClick={() => setConfirming(true)}
        variant="ghost"
        className={getLeaveTurnTriggerButtonClasses()}
        aria-label={getLeaveTurnTriggerAriaLabel()}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {getLeaveTurnTriggerButtonText()}
      </Button>
    );
  }

  return (
    <div
      role="region"
      aria-label={getLeaveTurnRegionAriaLabel()}
      className={getLeaveTurnConfirmContainerClasses()}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !isPending) {
          setConfirming(false);
        }
      }}
    >
      {isLateLeave && (
        <div className={getLeaveTurnLateLeaveCardClasses()}>
          <p className={getLeaveTurnLateLeaveTitleClasses()}>
            <span className={getLeaveTurnLateLeaveDotClasses()} />
            {getLateLeaveWarningTitle()}
          </p>
          <p className={getLeaveTurnLateLeaveDescriptionClasses()}>
            {getLateLeaveWarningDescription()}
          </p>
        </div>
      )}
      {wasFull && (
        <div className={getLeaveTurnWasFullCardClasses()}>
          <p className={getLeaveTurnWasFullPromptClasses()}>
            {getWasFullSharePromptText()}
          </p>
          <ShareButton
            title={getWasFullShareTitle()}
            text={getWasFullShareText(club)}
            url={createMagicLink({ resource: "turn", identifier: turnId }).url}
            variant="outline"
            className={getLeaveTurnWasFullShareButtonClasses()}
          />
        </div>
      )}
      <div className={getLeaveTurnActionGroupClasses()}>
        <Button
          onClick={() => setConfirming(false)}
          variant="outline"
          className={getLeaveTurnCancelButtonClasses()}
          disabled={isPending}
          aria-label={getCancelLeaveTurnAriaLabel()}
        >
          <X className="mr-2 h-4 w-4" />
          {getLeaveTurnCancelButtonText()}
        </Button>
        <Button
          onClick={handleLeave}
          variant="ghost"
          className={getLeaveTurnConfirmButtonClasses()}
          disabled={isPending}
          aria-busy={isPending}
          aria-label={getConfirmLeaveTurnAriaLabel({ isPending })}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          {getConfirmLeaveButtonText(isPending)}
        </Button>
      </div>
    </div>
  );
}
