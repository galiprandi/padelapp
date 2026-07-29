"use client";

import { useEffect, useCallback } from "react";

/**
 * Background Sync hook.
 *
 * Provides a `queueMutation` function that attempts a fetch request and,
 * if it fails due to network issues, enqueues it in the service worker's
 * IndexedDB for later replay via the Background Sync API.
 *
 * Browser support: Chrome/Edge on Android and desktop. iOS Safari does
 * not support Background Sync — the hook falls back to a normal retry.
 */
export function useBackgroundSync() {
  const supported = typeof window !== "undefined" && "serviceWorker" in navigator;

  const queueMutation = useCallback(
    async (url: string, options: RequestInit): Promise<Response | null> => {
      // Try the request immediately first
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        // Non-ok response: don't queue, let caller handle the error
        return response;
      } catch (error) {
        // Network error — queue for background sync if supported
        if (!supported) throw error;

        try {
          const reg = await navigator.serviceWorker.ready;
          const sw = reg.active;
          if (!sw) throw error;

          // Store the request in IndexedDB via postMessage to SW
          const body = options.body ? String(options.body) : "";
          sw.postMessage({
            type: "ENQUEUE_REQUEST",
            payload: {
              url,
              method: options.method || "POST",
              headers: options.headers
                ? Object.fromEntries(
                    new Headers(options.headers as Headers).entries(),
                  )
                : {},
              body,
            },
          });

          // Register for background sync
          if ("sync" in reg) {
            // @ts-expect-error — sync manager types not in all TS lib versions
            await reg.sync.register("padelred-bg-sync");
          }

          return null; // Queued, not completed
        } catch {
          throw error;
        }
      }
    },
    [supported],
  );

  // Listen for BG_SYNC_COMPLETE to refresh data
  useEffect(() => {
    if (!supported) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "BG_SYNC_COMPLETE") {
        // Trigger a soft refresh of the current page data
        window.dispatchEvent(new CustomEvent("bg-sync-complete"));
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [supported]);

  return { queueMutation, supported };
}
