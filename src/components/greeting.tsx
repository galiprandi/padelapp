"use client";

import { useEffect, useState } from "react";
import { getGreeting } from "@/lib/utils";

/**
 * Renders a time-based greeting that depends on the client's local time.
 * Must be a client component to avoid hydration mismatches — the server
 * runs in UTC (Vercel) while the client uses the device's timezone, so
 * getGreeting() can return different values on server vs client.
 */
export function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  // Render a stable placeholder during SSR and first paint to avoid
  // hydration mismatch. The real greeting appears after mount.
  if (greeting === null) {
    return (
      <h1 className="text-xl font-bold text-foreground">
        <span className="inline-block min-w-24">&nbsp;</span>
      </h1>
    );
  }

  return (
    <h1 className="text-xl font-bold text-foreground">
      {greeting}, {name}
    </h1>
  );
}
