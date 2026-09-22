"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  hasOnboardingBeenRedirected,
  setOnboardingRedirected,
} from "@/components/onboarding-checklist-utils";

interface OnboardingRedirectProps {
  hasAlias: boolean;
}

export function OnboardingRedirect({ hasAlias }: OnboardingRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    if (hasAlias) return;

    // Check if we have already redirected the user in this session
    if (!hasOnboardingBeenRedirected()) {
      setOnboardingRedirected();
      router.push("/me/profile?onboarding=true");
    }
  }, [hasAlias, router]);

  return null;
}
