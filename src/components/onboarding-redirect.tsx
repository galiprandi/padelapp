"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface OnboardingRedirectProps {
  hasAlias: boolean;
}

export function OnboardingRedirect({ hasAlias }: OnboardingRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    if (hasAlias) return;

    // Check if we have already redirected the user in this session
    const alreadyRedirected = sessionStorage.getItem("onboarding-redirected");
    if (!alreadyRedirected) {
      sessionStorage.setItem("onboarding-redirected", "true");
      router.push("/me/profile?onboarding=true");
    }
  }, [hasAlias, router]);

  return null;
}
