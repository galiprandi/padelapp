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

async function initFirebaseMessaging(config, vapidKey) {
  try {
    // Load Firebase from local files (avoids CSP issues with CDN)
    self.importScripts("/firebase/firebase-app-compat.js");
    self.importScripts("/firebase/firebase-messaging-compat.js");

    const app = self.firebase.initializeApp(config);
    const messaging = self.firebase.messaging(app);

    // Handle background messages
    messaging.onBackgroundMessage(function (payload) {
      var notification = payload.notification || {};
      var title = notification.title;
      var body = notification.body || "";
      var url = (payload.data && payload.data.url) || "/";

      self.registration.showNotification(title || "PadelApp", {
        body: body,
        icon: "/icon.svg",
        badge: "/icon.svg",
        data: { url: url },
      });
    });
  } catch (error) {
    console.error("Error initializing Firebase Messaging in SW:", error);
  }
}

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  var url = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then(function (clientList) {
      // Focus existing window if found
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
