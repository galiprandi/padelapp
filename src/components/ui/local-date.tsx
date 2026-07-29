"use client";

import { useEffect, useState } from "react";

interface LocalFormatProps {
  date: Date | string;
  options?: Intl.DateTimeFormatOptions;
  fallback?: string;
  locale?: string;
}

/**
 * Hydration-safe mount gate.
 * Returns false during SSR and the initial client render, then true
 * after mount. The setState-in-effect is intentional: it prevents
 * hydration mismatches when formatting dates with the user's locale.
 */
function useMountedGate() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  return mounted;
}

function toDate(date: Date | string): Date | null {
  try {
    return typeof date === "string" ? new Date(date) : date;
  } catch {
    return null;
  }
}

export function LocalDate({
  date,
  options = { weekday: "long", day: "numeric", month: "long" },
  fallback = "",
  locale = "es-ES",
}: LocalFormatProps) {
  const mounted = useMountedGate();

  if (!mounted) {
    return <span className="h-4 w-24 bg-muted animate-pulse rounded inline-block" />;
  }

  const d = toDate(date);
  if (!d) return <span>{fallback}</span>;
  return <span>{d.toLocaleDateString(locale, options)}</span>;
}

export function LocalTime({
  date,
  options = { hour: "2-digit", minute: "2-digit" },
  fallback = "",
  locale = "es-ES",
}: LocalFormatProps) {
  const mounted = useMountedGate();

  if (!mounted) {
    return <span className="h-4 w-12 bg-muted animate-pulse rounded inline-block" />;
  }

  const d = toDate(date);
  if (!d) return <span>{fallback}</span>;
  return <span>{d.toLocaleTimeString(locale, options)}</span>;
}

export function LocalDay({
  date,
  fallback = "",
}: {
  date: Date | string;
  fallback?: string;
}) {
  const mounted = useMountedGate();

  if (!mounted) {
    return <span className="h-6 w-6 bg-muted animate-pulse rounded inline-block" />;
  }

  const d = toDate(date);
  if (!d) return <span>{fallback}</span>;
  return <span>{d.getDate()}</span>;
}

export function LocalMonth({
  date,
  fallback = "",
  locale = "es-ES",
}: {
  date: Date | string;
  fallback?: string;
  locale?: string;
}) {
  const mounted = useMountedGate();

  if (!mounted) {
    return <span className="h-4 w-10 bg-muted animate-pulse rounded inline-block" />;
  }

  const d = toDate(date);
  if (!d) return <span>{fallback}</span>;
  return <span className="capitalize">{d.toLocaleDateString(locale, { month: "short" })}</span>;
}
