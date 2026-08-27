"use client";

import { useEffect, useState } from "react";
import { getGreeting, getLevelBadgeLabel } from "@/lib/utils";

/**
 * Renders a time-based greeting that depends on the client's local time.
 * Must be a client component to avoid hydration mismatches — the server
 * runs in UTC (Vercel) while the client uses the device's timezone, so
 * getGreeting() can return different values on server vs client.
 */
export function getOnboardingProgressCount({
  hasAlias,
  hasActivity,
  isPwaInstalled = false,
  hasNotifications = false,
}: {
  hasAlias: boolean;
  hasActivity: boolean;
  isPwaInstalled?: boolean;
  hasNotifications?: boolean;
}): number {
  return (
    (hasAlias ? 1 : 0) +
    (hasActivity ? 1 : 0) +
    (isPwaInstalled ? 1 : 0) +
    (hasNotifications ? 1 : 0)
  );
}

export function Greeting({
  name,
  level,
  hasAlias = true,
  matchesPlayed = 0,
}: {
  name: string;
  level?: number | null;
  hasAlias?: boolean;
  matchesPlayed?: number;
}) {
  const [greeting, setGreeting] = useState<string | null>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(getGreeting());

    if (typeof window !== "undefined") {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        ("navigator" in window && (window.navigator as unknown as { standalone?: boolean }).standalone)
      ) {
        setIsPwaInstalled(true);
      }
      if ("Notification" in window && Notification.permission === "granted") {
        setHasNotifications(true);
      }
    }
  }, []);

  // Render a stable placeholder during SSR and first paint to avoid
  // hydration mismatch. The real greeting appears after mount.
  if (greeting === null) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-foreground">
          <span className="inline-block min-w-24">&nbsp;</span>
        </h1>
      </div>
    );
  }

  const categoryLabel = level !== undefined && level !== null ? getLevelBadgeLabel(level) : null;
  const onboardingCount = getOnboardingProgressCount({
    hasAlias,
    hasActivity: matchesPlayed > 0,
    isPwaInstalled,
    hasNotifications,
  });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <h1 className="text-xl font-bold text-foreground">
        {greeting}, {name}
      </h1>
      {categoryLabel && (
        <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          {categoryLabel}
        </span>
      )}
      {onboardingCount < 4 && (
        <span
          className="inline-flex items-center rounded-md border border-border bg-card px-2 py-0.5 text-xs font-semibold text-primary shadow-xs font-mono"
          aria-label={`Progreso de preparación: ${onboardingCount} de 4 pasos completados`}
          title="Pasos completados en la guía de bienvenida"
        >
          {onboardingCount}/4
        </span>
      )}
    </div>
  );
}
