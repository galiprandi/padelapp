"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Check,
  Loader2,
  X,
  Smartphone,
  Bell,
} from "lucide-react";
import { usePwaInstalled } from "@/lib/hooks/use-pwa-installed";
import { usePushNotifications } from "@/lib/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast/use-toast";
import {
  ONBOARDING_CHECKLIST_DISMISS_KEY,
  isOnboardingChecklistDismissed,
  dismissOnboardingChecklist,
  clearOnboardingChecklistDismissal,
  calculateOnboardingProgress,
  getStepStatusAriaLabel,
  getOnboardingStepButtonAriaLabel,
  getOnboardingRegionAriaLabel,
  getOnboardingTitleText,
  getOnboardingDescriptionText,
  getOnboardingDismissAriaLabel,
  getOnboardingProgressTitleText,
  getOnboardingProgressText,
  getOnboardingCompletedSuccessText,
  getOnboardingNotificationToastMessage,
  getOnboardingStepTitleText,
  getOnboardingStepDescriptionText,
  getOnboardingStepButtonText,
  getOnboardingContainerClasses,
  getOnboardingDismissButtonClasses,
  getOnboardingStepBadgeClasses,
  getOnboardingStepButtonClasses,
  type OnboardingStepsState,
} from "@/components/onboarding-checklist-utils";

export {
  ONBOARDING_CHECKLIST_DISMISS_KEY,
  isOnboardingChecklistDismissed,
  dismissOnboardingChecklist,
  clearOnboardingChecklistDismissal,
  calculateOnboardingProgress,
  type OnboardingStepsState,
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface OnboardingChecklistProps {
  initialAlias: string | null;
  hasActivity: boolean;
}

export function OnboardingChecklist({
  initialAlias,
  hasActivity,
}: OnboardingChecklistProps) {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  const isPwaInstalled = usePwaInstalled();
  const { permission, requestPermission, loading: notificationLoading } =
    usePushNotifications();

  // 1. Checkmount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (isOnboardingChecklistDismissed()) {
      setDismissed(true);
    }
  }, []);

  // 2. Capture PWA BeforeInstallPrompt Event
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isPwaInstalled) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isPwaInstalled]);

  // 3. Handle PWA direct installation
  const handleInstallPwa = useCallback(async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error("PWA install prompt error:", err);
    } finally {
      setIsInstalling(false);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    dismissOnboardingChecklist();
  }, []);

  useEffect(() => {
    if (!mounted || dismissed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, dismissed, handleDismiss]);

  if (!mounted || dismissed) return null;

  // Evaluate each step's completion status
  const stepAliasCompleted = Boolean(initialAlias && initialAlias.trim().length > 0);
  const stepPwaCompleted = isPwaInstalled;
  const stepNotificationsCompleted = permission === "granted";
  const stepActivityCompleted = hasActivity;

  const { completedCount, progressPercent } = calculateOnboardingProgress({
    stepAliasCompleted,
    stepActivityCompleted,
    stepPwaCompleted,
    stepNotificationsCompleted,
  });

  return (
    <div
      role="region"
      aria-label={getOnboardingRegionAriaLabel()}
      className={getOnboardingContainerClasses()}
    >
      {/* Header section with progress bar */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">
            {getOnboardingTitleText()}
          </h2>
          <p className="text-xs text-muted-foreground leading-normal">
            {getOnboardingDescriptionText()}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          aria-label={getOnboardingDismissAriaLabel()}
          className={getOnboardingDismissButtonClasses()}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Progress display */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-foreground">
            {getOnboardingProgressTitleText()}
          </span>
          <span className="font-bold text-primary tabular-nums">
            {getOnboardingProgressText(completedCount, progressPercent)}
          </span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4 pt-1">
        {/* Step 1: Profile Alias */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              aria-label={getStepStatusAriaLabel(1, getOnboardingStepTitleText("alias"), stepAliasCompleted)}
              className={getOnboardingStepBadgeClasses(stepAliasCompleted)}
            >
              {stepAliasCompleted ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                "1"
              )}
            </div>
            <div className="w-px flex-1 bg-border my-1 min-h-[16px]" />
          </div>
          <div className="flex-1 space-y-1 pb-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-xs font-bold text-foreground">
                {getOnboardingStepTitleText("alias")}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              {getOnboardingStepDescriptionText("alias")}
            </p>
            {!stepAliasCompleted && (
              <div className="pt-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className={getOnboardingStepButtonClasses()}
                  aria-label={getOnboardingStepButtonAriaLabel("alias")}
                >
                  <Link href="/me/profile" prefetch={true}>{getOnboardingStepButtonText("alias")}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: First Turn (aha moment) */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              aria-label={getStepStatusAriaLabel(2, getOnboardingStepTitleText("activity"), stepActivityCompleted)}
              className={getOnboardingStepBadgeClasses(stepActivityCompleted)}
            >
              {stepActivityCompleted ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                "2"
              )}
            </div>
            <div className="w-px flex-1 bg-border my-1 min-h-[16px]" />
          </div>
          <div className="flex-1 space-y-1 pb-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-xs font-bold text-foreground">
                {getOnboardingStepTitleText("activity")}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              {getOnboardingStepDescriptionText("activity")}
            </p>
            {!stepActivityCompleted && (
              <div className="pt-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className={getOnboardingStepButtonClasses()}
                  aria-label={getOnboardingStepButtonAriaLabel("activity")}
                >
                  <Link href="/turnos/nuevo" prefetch={true}>{getOnboardingStepButtonText("activity")}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Install App (PWA) */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              aria-label={getStepStatusAriaLabel(3, getOnboardingStepTitleText("pwa"), stepPwaCompleted)}
              className={getOnboardingStepBadgeClasses(stepPwaCompleted)}
            >
              {stepPwaCompleted ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                "3"
              )}
            </div>
            <div className="w-px flex-1 bg-border my-1 min-h-[16px]" />
          </div>
          <div className="flex-1 space-y-1 pb-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-xs font-bold text-foreground">
                {getOnboardingStepTitleText("pwa")}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              {getOnboardingStepDescriptionText("pwa")}
            </p>
            {!stepPwaCompleted && (
              <div className="pt-1.5">
                {deferredPrompt ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleInstallPwa}
                    disabled={isInstalling}
                    aria-busy={isInstalling}
                    className={getOnboardingStepButtonClasses()}
                    aria-label={getOnboardingStepButtonAriaLabel("pwa-install", isInstalling)}
                  >
                    {isInstalling ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" aria-hidden="true" />
                    ) : (
                      <Smartphone className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    )}
                    {getOnboardingStepButtonText("pwa-install")}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className={getOnboardingStepButtonClasses()}
                    aria-label={getOnboardingStepButtonAriaLabel("pwa-guide")}
                  >
                    <Link href="/install" prefetch={true}>{getOnboardingStepButtonText("pwa-guide")}</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Enable Push Notifications */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              aria-label={getStepStatusAriaLabel(4, getOnboardingStepTitleText("notifications"), stepNotificationsCompleted)}
              className={getOnboardingStepBadgeClasses(stepNotificationsCompleted)}
            >
              {stepNotificationsCompleted ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                "4"
              )}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-xs font-bold text-foreground">
                {getOnboardingStepTitleText("notifications")}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              {getOnboardingStepDescriptionText("notifications")}
            </p>
            {!stepNotificationsCompleted && (
              <div className="pt-1.5">
                {permission === "unsupported" ? (
                  <span className="text-xs text-muted-foreground font-medium">
                    {getOnboardingNotificationToastMessage("unsupported")}
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const token = await requestPermission();
                      if (token) {
                        showToast(getOnboardingNotificationToastMessage("enabled"));
                      } else if (permission === "denied") {
                        showToast(getOnboardingNotificationToastMessage("denied"));
                      }
                    }}
                    disabled={notificationLoading}
                    aria-busy={notificationLoading}
                    className={getOnboardingStepButtonClasses()}
                    aria-label={getOnboardingStepButtonAriaLabel("notifications", notificationLoading)}
                  >
                    {notificationLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" aria-hidden="true" />
                    ) : (
                      <Bell className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    )}
                    {getOnboardingStepButtonText("notifications")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Congratulatory / All Done Message */}
      {completedCount === 4 && (
        <div className="rounded-lg bg-muted border border-primary p-3 text-center shadow-xs">
          <p className="text-xs font-bold text-foreground">
            {getOnboardingCompletedSuccessText()}
          </p>
        </div>
      )}
    </div>
  );
}
