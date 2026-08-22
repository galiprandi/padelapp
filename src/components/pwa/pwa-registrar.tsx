"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .catch((err) => {
        console.warn("Service worker proactive registration skipped:", err);
      });
  }, []);

  return null;
}
