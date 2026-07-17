"use client";

import { useEffect, useState } from "react";

/**
 * Returns false during SSR and the initial client render, then true
 * after the component has mounted (first useEffect).
 *
 * Use this to gate rendering of content that depends on browser-only
 * APIs (e.g. new Date() with local timezone) to avoid hydration
 * mismatches (React error #418).
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
