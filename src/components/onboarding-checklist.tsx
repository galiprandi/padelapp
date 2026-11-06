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
  getOnboardingHeaderClasses,
  getOnboardingHeaderTextContainerClasses,
  getOnboardingHeaderTitleClasses,
  getOnboardingHeaderDescriptionClasses,
  getOnboardingDismissIconClasses,
  getOnboardingProgressContainerClasses,
  getOnboardingProgressHeaderClasses,
  getOnboardingProgressTitleClasses,
  getOnboardingProgressValueClasses,
  getOnboardingProgressBarBackgroundClasses,
  getOnboardingProgressBarFillClasses,
  getOnboardingStepsListClasses,
  getOnboardingStepItemClasses,
  getOnboardingStepBadgeColumnClasses,
  getOnboardingStepConnectorLineClasses,
  getOnboardingStepContentClasses,
  getOnboardingStepHeaderRowClasses,
  getOnboardingStepTitleClasses,
  getOnboardingStepDescriptionClasses,
  getOnboardingStepActionWrapperClasses,
  getOnboardingStepCheckIconClasses,
  getOnboardingStepActionSpinnerClasses,
  getOnboardingStepActionDeviceIconClasses,
  getOnboardingStepActionBellIconClasses,
  getOnboardingUnsupportedNoticeClasses,
  getOnboardingSuccessBannerClasses,
  getOnboardingSuccessTextClasses,
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
      <div className={getOnboardingHeaderClasses()}>
        <div className={getOnboardingHeaderTextContainerClasses()}>
          <h2 className={getOnboardingHeaderTitleClasses()}>
            {getOnboardingTitleText()}
          </h2>
          <p className={getOnboardingHeaderDescriptionClasses()}>
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
          <X className={getOnboardingDismissIconClasses()} aria-hidden="true" />
        </Button>
      </div>

      {/* Progress display */}
      <div className={getOnboardingProgressContainerClasses()}>
        <div className={getOnboardingProgressHeaderClasses()}>
          <span className={getOnboardingProgressTitleClasses()}>
            {getOnboardingProgressTitleText()}
          </span>
          <span className={getOnboardingProgressValueClasses()}>
            {getOnboardingProgressText(completedCount, progressPercent)}
          </span>
        </div>
        <div className={getOnboardingProgressBarBackgroundClasses()}>
          <div
            className={getOnboardingProgressBarFillClasses()}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className={getOnboardingStepsListClasses()}>
        {/* Step 1: Profile Alias */}
        <div className={getOnboardingStepItemClasses()}>
          <div className={getOnboardingStepBadgeColumnClasses()}>
            <div
              aria-label={getStepStatusAriaLabel(1, getOnboardingStepTitleText("alias"), stepAliasCompleted)}
              className={getOnboardingStepBadgeClasses(stepAliasCompleted)}
            >
              {stepAliasCompleted ? (
                <Check className={getOnboardingStepCheckIconClasses()} aria-hidden="true" />
              ) : (
                "1"
              )}
            </div>
            <div className={getOnboardingStepConnectorLineClasses()} />
          </div>
          <div className={getOnboardingStepContentClasses(true)}>
            <div className={getOnboardingStepHeaderRowClasses()}>
              <h3 className={getOnboardingStepTitleClasses()}>
                {getOnboardingStepTitleText("alias")}
              </h3>
            </div>
            <p className={getOnboardingStepDescriptionClasses()}>
              {getOnboardingStepDescriptionText("alias")}
            </p>
            {!stepAliasCompleted && (
              <div className={getOnboardingStepActionWrapperClasses()}>
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
        <div className={getOnboardingStepItemClasses()}>
          <div className={getOnboardingStepBadgeColumnClasses()}>
            <div
              aria-label={getStepStatusAriaLabel(2, getOnboardingStepTitleText("activity"), stepActivityCompleted)}
              className={getOnboardingStepBadgeClasses(stepActivityCompleted)}
            >
              {stepActivityCompleted ? (
                <Check className={getOnboardingStepCheckIconClasses()} aria-hidden="true" />
              ) : (
                "2"
              )}
            </div>
            <div className={getOnboardingStepConnectorLineClasses()} />
          </div>
          <div className={getOnboardingStepContentClasses(true)}>
            <div className={getOnboardingStepHeaderRowClasses()}>
              <h3 className={getOnboardingStepTitleClasses()}>
                {getOnboardingStepTitleText("activity")}
              </h3>
            </div>
            <p className={getOnboardingStepDescriptionClasses()}>
              {getOnboardingStepDescriptionText("activity")}
            </p>
            {!stepActivityCompleted && (
              <div className={getOnboardingStepActionWrapperClasses()}>
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
        <div className={getOnboardingStepItemClasses()}>
          <div className={getOnboardingStepBadgeColumnClasses()}>
            <div
              aria-label={getStepStatusAriaLabel(3, getOnboardingStepTitleText("pwa"), stepPwaCompleted)}
              className={getOnboardingStepBadgeClasses(stepPwaCompleted)}
            >
              {stepPwaCompleted ? (
                <Check className={getOnboardingStepCheckIconClasses()} aria-hidden="true" />
              ) : (
                "3"
              )}
            </div>
            <div className={getOnboardingStepConnectorLineClasses()} />
          </div>
          <div className={getOnboardingStepContentClasses(true)}>
            <div className={getOnboardingStepHeaderRowClasses()}>
              <h3 className={getOnboardingStepTitleClasses()}>
                {getOnboardingStepTitleText("pwa")}
              </h3>
            </div>
            <p className={getOnboardingStepDescriptionClasses()}>
              {getOnboardingStepDescriptionText("pwa")}
            </p>
            {!stepPwaCompleted && (
              <div className={getOnboardingStepActionWrapperClasses()}>
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
                      <Loader2 className={getOnboardingStepActionSpinnerClasses()} aria-hidden="true" />
                    ) : (
                      <Smartphone className={getOnboardingStepActionDeviceIconClasses()} aria-hidden="true" />
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
        <div className={getOnboardingStepItemClasses()}>
          <div className={getOnboardingStepBadgeColumnClasses()}>
            <div
              aria-label={getStepStatusAriaLabel(4, getOnboardingStepTitleText("notifications"), stepNotificationsCompleted)}
              className={getOnboardingStepBadgeClasses(stepNotificationsCompleted)}
            >
              {stepNotificationsCompleted ? (
                <Check className={getOnboardingStepCheckIconClasses()} aria-hidden="true" />
              ) : (
                "4"
              )}
            </div>
          </div>
          <div className={getOnboardingStepContentClasses(false)}>
            <div className={getOnboardingStepHeaderRowClasses()}>
              <h3 className={getOnboardingStepTitleClasses()}>
                {getOnboardingStepTitleText("notifications")}
              </h3>
            </div>
            <p className={getOnboardingStepDescriptionClasses()}>
              {getOnboardingStepDescriptionText("notifications")}
            </p>
            {!stepNotificationsCompleted && (
              <div className={getOnboardingStepActionWrapperClasses()}>
                {permission === "unsupported" ? (
                  <span className={getOnboardingUnsupportedNoticeClasses()}>
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
                      <Loader2 className={getOnboardingStepActionSpinnerClasses()} aria-hidden="true" />
                    ) : (
                      <Bell className={getOnboardingStepActionBellIconClasses()} aria-hidden="true" />
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
        <div className={getOnboardingSuccessBannerClasses()}>
          <p className={getOnboardingSuccessTextClasses()}>
            {getOnboardingCompletedSuccessText()}
          </p>
        </div>
      )}
    </div>
  );
}
