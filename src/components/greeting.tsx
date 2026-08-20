"use client";

import { useEffect, useState } from "react";
import { getGreeting, getLevelBadgeLabel } from "@/lib/utils";

/**
 * Renders a time-based greeting that depends on the client's local time.
 * Must be a client component to avoid hydration mismatches — the server
 * runs in UTC (Vercel) while the client uses the device's timezone, so
 * getGreeting() can return different values on server vs client.
 */
export function Greeting({ name, level }: { name: string; level?: number | null }) {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(getGreeting());
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
    </div>
  );
}
