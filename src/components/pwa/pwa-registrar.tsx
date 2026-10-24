"use client";

import { useEffect } from "react";
import {
  isServiceWorkerSupported,
  getServiceWorkerRegistrationUrl,
  getPwaRegistrarProps,
  getPwaRegistrarErrorWarnMessage,
} from "./pwa-utils";

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !isServiceWorkerSupported()) {
      return;
    }

    navigator.serviceWorker
      .register(getServiceWorkerRegistrationUrl())
      .catch((err) => {
        console.warn(getPwaRegistrarErrorWarnMessage(err));
      });
  }, []);

  return <div {...getPwaRegistrarProps()} />;
}
