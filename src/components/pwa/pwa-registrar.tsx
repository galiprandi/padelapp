"use client";

import { useEffect } from "react";
import {
  isServiceWorkerSupported,
  getServiceWorkerRegistrationUrl,
} from "./pwa-utils";

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !isServiceWorkerSupported()) {
      return;
    }

    navigator.serviceWorker
      .register(getServiceWorkerRegistrationUrl())
      .catch((err) => {
        console.warn("Service worker proactive registration skipped:", err);
      });
  }, []);

  return null;
}
