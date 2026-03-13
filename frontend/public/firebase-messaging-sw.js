/* eslint-env serviceworker */
/* global firebase, importScripts */
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

self.addEventListener("install", () => {
  console.log("[FCM-SW] Installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[FCM-SW] Activating...");
  event.waitUntil(self.clients.claim());
});

function applyConfig(data) {
  firebaseConfig.apiKey = data.apiKey || data.FIREBASE_API_KEY || "";
  firebaseConfig.authDomain = data.authDomain || data.FIREBASE_AUTH_DOMAIN || "";
  firebaseConfig.projectId = data.projectId || data.FIREBASE_PROJECT_ID || "";
  firebaseConfig.storageBucket = data.storageBucket || data.FIREBASE_STORAGE_BUCKET || "";
  firebaseConfig.messagingSenderId = data.messagingSenderId || data.FIREBASE_MESSAGING_SENDER_ID || "";
  firebaseConfig.appId = data.appId || data.FIREBASE_APP_ID || "";
}

function hasValidConfig() {
  return !!(firebaseConfig.projectId && firebaseConfig.appId);
}

let firebaseInitialized = false;

async function initFirebase() {
  if (firebaseInitialized) return;

  // 1. Try the Vite dev-server middleware / build-time generated config
  try {
    const res = await fetch("/firebase-config.json");
    if (res.ok) {
      applyConfig(await res.json());
      console.log("[FCM-SW] Config loaded from /firebase-config.json, projectId:", firebaseConfig.projectId);
    }
  } catch (e) {
    console.warn("[FCM-SW] /firebase-config.json fetch failed:", e.message);
  }

  // 2. Fallback: backend API
  if (!hasValidConfig()) {
    try {
      const res = await fetch("/api/env/public");
      if (res.ok) {
        const json = await res.json();
        if (json?.data) applyConfig(json.data);
        console.log("[FCM-SW] Config loaded from /api/env/public, projectId:", firebaseConfig.projectId);
      }
    } catch (e) {
      console.warn("[FCM-SW] /api/env/public fetch failed:", e.message);
    }
  }

  if (hasValidConfig()) {
    try {
      firebase.initializeApp(firebaseConfig);
      firebaseInitialized = true;
      console.log("[FCM-SW] Firebase initialized. projectId:", firebaseConfig.projectId);

      const messaging = firebase.messaging();
      messaging.onBackgroundMessage((payload) => {
        console.log("[FCM-SW] onBackgroundMessage:", payload);
        const title = payload.notification?.title || "TruOrder";
        const options = {
          body: payload.notification?.body || "",
          icon: "/notification-icon.png",
          badge: "/notification-icon.png",
          image: payload.notification?.image || undefined,
          vibrate: [200, 100, 200],
          tag: "truorder-" + Date.now(),
          requireInteraction: false,
          actions: [
            { action: "open", title: "View" },
            { action: "dismiss", title: "Dismiss" },
          ],
          data: payload.data || {},
        };
        return self.registration.showNotification(title, options);
      });
    } catch (e) {
      console.error("[FCM-SW] Firebase init error:", e.message);
    }
  } else {
    console.warn("[FCM-SW] No valid Firebase config found. Push notifications will not work.");
  }
}

// Generic push event handler as safety net
// If Firebase SDK doesn't handle the push, this catches it
self.addEventListener("push", (event) => {
  console.log("[FCM-SW] Push event received:", event);
  if (!event.data) return;

  try {
    const payload = event.data.json();
    if (!payload.notification) {
      const title = payload.data?.title || "TruOrder";
      const body = payload.data?.body || "You have a new notification";
      event.waitUntil(
        self.registration.showNotification(title, {
          body,
          icon: "/notification-icon.png",
          badge: "/notification-icon.png",
          vibrate: [200, 100, 200],
          tag: "truorder-" + Date.now(),
          data: payload.data || {},
        })
      );
    }
  } catch (e) {
    console.warn("[FCM-SW] Error handling push event:", e);
  }
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[FCM-SW] Notification clicked:", event.action, event);
  event.notification.close();

  if (event.action === "dismiss") return;

  const urlToOpen = event.notification?.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});

initFirebase();
