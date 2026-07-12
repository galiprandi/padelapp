"use client";

import { useEffect, useState } from "react";

interface LocalFormatProps {
  date: Date | string;
  options?: Intl.DateTimeFormatOptions;
  fallback?: string;
  locale?: string;
}

export function LocalDate({
  date,
  options = { weekday: "long", day: "numeric", month: "long" },
  fallback = "",
  locale = "es-ES",
}: LocalFormatProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="h-4 w-24 bg-muted animate-pulse rounded inline-block" />;
  }

  try {
    const d = typeof date === "string" ? new Date(date) : date;
    const formatted = d.toLocaleDateString(locale, options);
    return <span>{formatted}</span>;
  } catch (e) {
    return <span>{fallback}</span>;
  }
}

export function LocalTime({
  date,
  options = { hour: "2-digit", minute: "2-digit" },
  fallback = "",
  locale = "es-ES",
}: LocalFormatProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="h-4 w-12 bg-muted animate-pulse rounded inline-block" />;
  }

  try {
    const d = typeof date === "string" ? new Date(date) : date;
    const formatted = d.toLocaleTimeString(locale, options);
    return <span>{formatted}</span>;
  } catch (e) {
    return <span>{fallback}</span>;
  }
}

export function LocalDay({
  date,
  fallback = "",
}: {
  date: Date | string;
  fallback?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="h-6 w-6 bg-muted animate-pulse rounded inline-block" />;
  }

  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return <span>{d.getDate()}</span>;
  } catch (e) {
    return <span>{fallback}</span>;
  }
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="h-4 w-10 bg-muted animate-pulse rounded inline-block" />;
  }

  try {
    const d = typeof date === "string" ? new Date(date) : date;
    const formatted = d.toLocaleDateString(locale, { month: "short" });
    return <span className="capitalize">{formatted}</span>;
  } catch (e) {
    return <span>{fallback}</span>;
  }
}
