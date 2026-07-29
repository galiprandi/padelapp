"use client";

import { useEffect, useState } from "react";

interface UseAppBadgeResult {
  setBadge: (count: number) => Promise<void>;
  clearBadge: () => Promise<void>;
  supported: boolean;
}

/**
 * Badging API hook.
 *
 * Shows a numeric counter on the app icon when there are pending actions
 * (e.g. turns that need players). The badge persists after the user closes
 * the notification, providing a silent visual reminder.
 *
 * Browser support: Chrome/Edge on Android and desktop. iOS Safari does not
 * support the Badging API — the hook is a no-op there.
 */
export function useAppBadge(): UseAppBadgeResult {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- detects Badging API support on mount
    setSupported(
      typeof navigator !== "undefined" && "setAppBadge" in navigator,
    );
  }, []);

  const setBadge = async (count: number) => {
    if (!supported || !navigator.setAppBadge) return;
    try {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await navigator.clearAppBadge();
      }
    } catch {
      // Badge API can fail if the app is not installed or permission is denied
    }
  };

  const clearBadge = async () => {
    if (!supported || !navigator.clearAppBadge) return;
    try {
      await navigator.clearAppBadge();
    } catch {
      // Silently ignore
    }
  };

  return { setBadge, clearBadge, supported };
}
