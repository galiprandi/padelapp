"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2 } from "lucide-react";
import { usePushNotifications } from "@/lib/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import {
  PUSH_PROMPT_DISMISS_KEY,
  isPushPromptDismissed,
  dismissPushPrompt,
  clearPushPromptDismissal,
  getPushPermissionRegionAriaLabel,
  getPushPermissionTitle,
  getPushPermissionDescription,
  getPushPermissionActionButtonLabel,
  getPushPermissionActionButtonAriaLabel,
  getPushPermissionDismissButtonText,
  getPushPermissionDismissButtonAriaLabel,
  getPushPermissionSuccessToast,
  getPushPermissionLiveStatus,
  getPushPermissionContainerClasses,
  getPushPermissionIconBadgeClasses,
  getPushPermissionActionButtonClasses,
  getPushPermissionDismissButtonClasses,
  getPushPermissionInnerLayoutClasses,
  getPushPermissionTextContainerClasses,
  getPushPermissionTitleClasses,
  getPushPermissionDescriptionClasses,
  getPushPermissionActionGroupClasses,
  getPushPermissionBellIconClasses,
  getPushPermissionActionBellIconClasses,
  getPushPermissionActionSpinnerClasses,
} from "./push-permission-utils";

export {
  PUSH_PROMPT_DISMISS_KEY,
  isPushPromptDismissed,
  dismissPushPrompt,
  clearPushPromptDismissal,
};

export function PushPermissionPrompt() {
  const { showToast } = useToast();
  const { permission, requestPermission, loading } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (typeof window !== "undefined") {
      setDismissed(isPushPromptDismissed());
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    dismissPushPrompt();
  };

  useEffect(() => {
    if (!mounted || dismissed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, dismissed]);

  // Don't render during SSR — permission state is only known on the client.
  if (
    !mounted ||
    dismissed ||
    permission === "granted" ||
    permission === "denied" ||
    permission === "unsupported"
  ) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label={getPushPermissionRegionAriaLabel()}
      aria-busy={loading}
      className={getPushPermissionContainerClasses()}
    >
      <div className={getPushPermissionInnerLayoutClasses()}>
        <div className={getPushPermissionIconBadgeClasses()}>
          <Bell className={getPushPermissionBellIconClasses()} aria-hidden="true" />
        </div>
        <div className={getPushPermissionTextContainerClasses()}>
          <h3 className={getPushPermissionTitleClasses()}>
            {getPushPermissionTitle()}
          </h3>
          <p className={getPushPermissionDescriptionClasses()}>
            {getPushPermissionDescription()}
          </p>
          <div className={getPushPermissionActionGroupClasses()}>
            <Button
              onClick={async () => {
                const token = await requestPermission();
                if (token) {
                  showToast(getPushPermissionSuccessToast());
                }
              }}
              disabled={loading}
              size="sm"
              aria-label={getPushPermissionActionButtonAriaLabel(loading)}
              className={getPushPermissionActionButtonClasses()}
            >
              {loading ? (
                <Loader2
                  className={getPushPermissionActionSpinnerClasses()}
                  aria-hidden="true"
                />
              ) : (
                <Bell
                  className={getPushPermissionActionBellIconClasses()}
                  aria-hidden="true"
                />
              )}
              {getPushPermissionActionButtonLabel(loading)}
            </Button>
            <Button
              variant="ghost"
              onClick={handleDismiss}
              disabled={loading}
              size="sm"
              aria-label={getPushPermissionDismissButtonAriaLabel()}
              className={getPushPermissionDismissButtonClasses()}
            >
              {getPushPermissionDismissButtonText()}
            </Button>
          </div>
        </div>
      </div>
      <div className="sr-only" aria-live="polite">
        {getPushPermissionLiveStatus(loading)}
      </div>
    </div>
  );
}
