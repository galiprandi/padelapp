// Firebase Messaging Service Worker
// Activated when NEXT_PUBLIC_FIREBASE_* env vars are configured

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Only initialize Firebase if config is available via importScripts
// The config is injected dynamically from the client side
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INIT_FIREBASE") {
    const { config, vapidKey } = event.data;
    if (config && vapidKey) {
      initFirebaseMessaging(config, vapidKey);
    }
  }
});

async function initFirebaseMessaging(config: any, vapidKey: string) {
  try {
    // Load Firebase from CDN (compat version for service worker)
    self.importScripts(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
    );
    self.importScripts(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
    );

    const app = (self as any).firebase.initializeApp(config);
    const messaging = (self as any).firebase.messaging(app);

    // Handle background messages
    messaging.onBackgroundMessage((payload: any) => {
      const { title, body } = payload.notification || {};
      const url = payload.data?.url || "/";

      const notificationOptions: NotificationOptions = {
        body: body || "",
        icon: "/icon.svg",
        badge: "/icon.svg",
        data: { url },
      };

      (self as any).registration.showNotification(
        title || "PadelApp",
        notificationOptions
      );
    });
  } catch (error) {
    console.error("Error initializing Firebase Messaging in SW:", error);
  }
}

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = (event.notification as any).data?.url || "/";

  event.waitUntil(
    (self as any).clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList: any[]) => {
      // Focus existing window if found
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window
      if ((self as any).clients.openWindow) {
        return (self as any).clients.openWindow(url);
      }
    })
  );
});
