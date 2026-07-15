"use client";

import { useEffect, useState, useCallback } from "react";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
}

function getFirebaseConfig(): FirebaseConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !projectId || !messagingSenderId || !appId) {
    return null;
  }

  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? `${projectId}.firebaseapp.com`;

  return { apiKey, authDomain, projectId, messagingSenderId, appId };
}

type PermissionState = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission as PermissionState);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined") return null;
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return null;
    }

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);

      if (result !== "granted") return null;

      const config = getFirebaseConfig();
      if (!config) {
        console.warn("Firebase config not set — push permission granted but no token");
        return null;
      }

      const { initializeApp } = await import("firebase/app");
      const { getMessaging, getToken } = await import("firebase/messaging");

      const app = initializeApp(config);
      const messaging = getMessaging(app);

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.warn("VAPID key not set — cannot get FCM token");
        return null;
      }

      const fcmToken = await getToken(messaging, { vapidKey });
      setToken(fcmToken);

      await registerTokenOnServer(fcmToken);
      return fcmToken;
    } catch (error) {
      console.error("Error requesting push permission:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { permission, token, loading, requestPermission };
}

async function registerTokenOnServer(token: string) {
  try {
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error("Error registering push token on server:", error);
  }
}
