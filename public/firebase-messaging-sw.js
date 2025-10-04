self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Placeholder para inicializar Firebase Messaging cuando se configure.
// importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');
