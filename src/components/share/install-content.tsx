"use client";

import { useState, useCallback, useEffect } from "react";
import { Share, PlusSquare, Smartphone, Check } from "lucide-react";
import { InstallButton } from "@/components/share/install-button";
import { usePwaInstalled } from "@/lib/hooks/use-pwa-installed";
import {
  isIOSDeviceUserAgent,
  getPlatformSteps,
  getNextPlatformValue,
  getPlatformRadioAriaLabel,
  getInstallStatusAriaLabel,
  getAlreadyInstalledTitleText,
  getAlreadyInstalledDescriptionText,
  getPlatformSelectorHeaderText,
  getPlatformSelectorHeaderClasses,
  getPlatformOptionLabelText,
  getPlatformRadioClasses,
  getManualInstallDividerText,
  getManualInstallDividerClasses,
  getInstallStepContainerClasses,
  getInstallStepIconBadgeClasses,
  getInstallStepIconClasses,
  getInstallStepTitleClasses,
  getInstallStepDescriptionClasses,
  getAlreadyInstalledContainerClasses,
  getAlreadyInstalledIconBadgeClasses,
  getAlreadyInstalledTitleClasses,
  getAlreadyInstalledDescriptionClasses,
  PlatformType,
  InstallStep,
} from "@/components/share/install-utils";

export function InstallContent() {
  const isInstalled = usePwaInstalled();
  const [hasInstallButton, setHasInstallButton] = useState(false);
  const [platform, setPlatform] = useState<PlatformType>("android");

  // Auto-detect operating system on mount to improve conversion & user onboarding
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isIOS = isIOSDeviceUserAgent(
      window.navigator.userAgent,
      "ontouchend" in document
    );
    if (isIOS) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlatform("ios");
    }
  }, []);

  const handleAvailability = useCallback((available: boolean) => {
    setHasInstallButton(available);
  }, []);

  if (isInstalled) {
    return (
      <div
        role="region"
        aria-label={getInstallStatusAriaLabel(true)}
        className={getAlreadyInstalledContainerClasses()}
      >
        <div className={getAlreadyInstalledIconBadgeClasses()}>
          <Check className="h-6 w-6 text-emerald-500" aria-hidden="true" />
        </div>
        <p className={getAlreadyInstalledTitleClasses()}>
          {getAlreadyInstalledTitleText()}
        </p>
        <p className={getAlreadyInstalledDescriptionClasses()}>
          {getAlreadyInstalledDescriptionText()}
        </p>
      </div>
    );
  }

  const steps = getPlatformSteps(platform);

  const renderIcon = (iconName: InstallStep["iconName"]) => {
    const iconClasses = getInstallStepIconClasses();
    switch (iconName) {
      case "share":
        return <Share className={iconClasses} aria-hidden="true" />;
      case "plus-square":
        return <PlusSquare className={iconClasses} aria-hidden="true" />;
      case "smartphone":
        return <Smartphone className={iconClasses} aria-hidden="true" />;
      case "check":
        return <Check className={iconClasses} aria-hidden="true" />;
    }
  };

  return (
    <div
      role="region"
      aria-label={getInstallStatusAriaLabel(false)}
      className="space-y-6"
    >
      {/* Platform Toggle (Custom selection button group standardizing h-12 and active:scale-[0.98]) */}
      <div className="space-y-2">
        <span
          id="platform-selector-label"
          className={getPlatformSelectorHeaderClasses()}
        >
          {getPlatformSelectorHeaderText()}
        </span>
        <div
          role="radiogroup"
          aria-labelledby="platform-selector-label"
          className="grid grid-cols-2 gap-2"
          onKeyDown={(e) => {
            const next = getNextPlatformValue(platform, e.key);
            if (next !== platform) {
              e.preventDefault();
              setPlatform(next);
              const buttons = Array.from(
                e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')
              );
              const idx = next === "ios" ? 1 : 0;
              buttons[idx]?.focus();
            }
          }}
        >
          <button
            type="button"
            role="radio"
            aria-checked={platform === "android"}
            tabIndex={platform === "android" ? 0 : -1}
            aria-label={getPlatformRadioAriaLabel("android")}
            onClick={() => setPlatform("android")}
            className={getPlatformRadioClasses(platform === "android")}
          >
            {getPlatformOptionLabelText("android")}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={platform === "ios"}
            tabIndex={platform === "ios" ? 0 : -1}
            aria-label={getPlatformRadioAriaLabel("ios")}
            onClick={() => setPlatform("ios")}
            className={getPlatformRadioClasses(platform === "ios")}
          >
            {getPlatformOptionLabelText("ios")}
          </button>
        </div>
      </div>

      {platform === "android" && (
        <>
          <InstallButton onAvailabilityChange={handleAvailability} />

          {hasInstallButton && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className={getManualInstallDividerClasses()}>
                  {getManualInstallDividerText()}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Platform-Specific Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className={getInstallStepContainerClasses()}>
            <div className={getInstallStepIconBadgeClasses()}>
              {renderIcon(step.iconName)}
            </div>
            <div className="space-y-0.5">
              <p className={getInstallStepTitleClasses()}>{step.title}</p>
              <p className={getInstallStepDescriptionClasses()}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
