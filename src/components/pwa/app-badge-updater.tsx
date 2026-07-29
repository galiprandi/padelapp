"use client";

import { useEffect } from "react";

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
    if (typeof navigator === "undefined") return;
    if (!("setAppBadge" in navigator)) return;

    const updateBadge = async () => {
      try {
        if (count > 0) {
          await navigator.setAppBadge(count);
        } else {
          await navigator.clearAppBadge();
        }
      } catch {
        // Badge API can fail if app is not installed — silently ignore
      }
    };

    void updateBadge();
  }, [count]);

  return null;
}
