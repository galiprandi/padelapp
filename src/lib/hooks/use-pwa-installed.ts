"use client";

import { useEffect, useState } from "react";

/**
 * Detects whether the app is running as an installed PWA (standalone mode)
 * or inside a regular browser tab.
 *
 * Uses `display-mode: standalone` (Android/Chrome) and `navigator.standalone`
 * (iOS/Safari) to determine installation status.
 */
export function usePwaInstalled() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true;
      setIsInstalled(standalone);
    };

    checkInstalled();

    const mql = window.matchMedia("(display-mode: standalone)");
    mql.addEventListener("change", checkInstalled);

    return () => mql.removeEventListener("change", checkInstalled);
  }, []);

  return isInstalled;
}
