"use client";

import { useEffect } from "react";
import { updateAppBadge, getAppBadgeAriaAttributes } from "./pwa-utils";

/**
 * Sets the app icon badge (Badging API) to the given count.
 *
 * Renders nothing — it's a side-effect-only component that updates the
 * badge whenever the count changes. Place it once in the dashboard layout.
 *
 * The count represents pending actions: turns that need players + pending
 * match confirmations + pending attendance markings.
 */
export function AppBadgeUpdater({ count }: { count: number }) {
  useEffect(() => {
    void updateAppBadge(count);
  }, [count]);

  return <div className="sr-only" {...getAppBadgeAriaAttributes(count)} />;
}
