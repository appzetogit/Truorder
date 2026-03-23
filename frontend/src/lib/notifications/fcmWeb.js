import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { ensureFirebaseInitialized, getFirebaseVapidKey } from "@/lib/firebase";
import { authAPI, restaurantAPI, deliveryAPI } from "@/lib/api";
import { toast } from "sonner";

const FCM_SW_PATH = "/firebase-messaging-sw.js";
const FCM_SW_SCOPE = "/firebase-cloud-messaging-push-scope/";

// Internal helper to get a browser FCM token (shared by user + restaurant)
async function getBrowserFcmToken() {
  console.log("[FCM] Starting web FCM registration flow");

  // Ensure Firebase app is initialized
  const app = await ensureFirebaseInitialized();
  if (!app) {
    console.warn("[FCM] Firebase app not initialized, skipping FCM registration");
    return null;
  }

  // Check if Messaging is supported in this browser
  const supported = await isSupported();
  if (!supported) {
    console.warn("[FCM] Firebase messaging is not supported in this browser");
    return null;
  }

  // Request notification permission
  if (typeof Notification !== "undefined") {
    const permission = await Notification.requestPermission();
    console.log("[FCM] Notification permission:", permission);
    if (permission !== "granted") {
      return null;
    }
  } else {
    console.warn("[FCM] Notification API not available");
    return null;
  }

  const messaging = getMessaging(app);
  const vapidKey = getFirebaseVapidKey();
  if (!vapidKey) {
    console.warn(
      "[FCM] No VAPID key. Set FIREBASE_VAPID_KEY in Admin → Environment Variables, or VITE_FIREBASE_VAPID_KEY in .env",
    );
    return null;
  }

  // Register our service worker so Firebase does not try to use the non-existent default path
  const registration = await navigator.serviceWorker.register(FCM_SW_PATH, {
    scope: FCM_SW_SCOPE,
  });
  await registration.ready;

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });
  console.log("[FCM] getToken result length:", token?.length || 0);

  if (!token) {
    console.warn(
      "[FCM] No FCM token from getToken. Ensure notification permission is granted and VAPID key is set.",
    );
    return null;
  }

  return token;
}

export async function registerFcmTokenForLoggedInUser() {
  try {
    const token = await getBrowserFcmToken();
    if (!token) return;

    console.log("[FCM] Token to send (user):", token.substring(0, 30) + "...");
    const res = await authAPI.registerFcmToken("web", token);
    const saved =
      res?.data?.data?.fcmTokenWeb ?? res?.data?.data?.fcmtokenWeb;
    console.log(
      "[FCM] Backend saved user fcmTokenWeb:",
      saved ? saved.substring(0, 30) + "..." : "null",
    );
  } catch (error) {
    console.error(
      "[FCM] Error during user web FCM registration:",
      error?.message || error,
    );
    if (error?.code === "messaging/permission-blocked") {
      console.warn(
        "[FCM] User denied notification permission. Token will stay null until permission is granted.",
      );
    } else if (error?.code === "messaging/invalid-vapid-key") {
      console.warn("[FCM] Invalid VAPID key. Check VITE_FIREBASE_VAPID_KEY in .env.");
    }
  }
}

export async function registerFcmTokenForRestaurant() {
  try {
    const token = await getBrowserFcmToken();
    if (!token) return;

    console.log(
      "[FCM][Restaurant] Token to send:",
      token.substring(0, 30) + "...",
    );
    const res = await restaurantAPI.registerFcmToken("web", token);
    const saved =
      res?.data?.data?.fcmTokenWeb ?? res?.data?.data?.fcmtokenWeb;
    console.log(
      "[FCM][Restaurant] Backend saved fcmTokenWeb:",
      saved ? saved.substring(0, 30) + "..." : "null",
    );
  } catch (error) {
    console.error(
      "[FCM][Restaurant] Error during web FCM registration:",
      error?.message || error,
    );
  }
}

export async function removeFcmTokenForLoggedInUser() {
  try {
    await authAPI.removeFcmToken("web");
  } catch (error) {
    console.error("[FCM] Error removing FCM token for web:", error);
  }
}

export async function removeFcmTokenForRestaurant() {
  try {
    await restaurantAPI.removeFcmToken("web");
  } catch (error) {
    console.error("[FCM][Restaurant] Error removing FCM token for web:", error);
  }
}

export async function registerFcmTokenForDelivery() {
  try {
    const token = await getBrowserFcmToken();
    if (!token) return;

    console.log("[FCM][Delivery] Token to send:", token.substring(0, 30) + "...");
    const res = await deliveryAPI.registerFcmToken("web", token);
    const saved = res?.data?.data?.fcmTokenWeb ?? res?.data?.data?.fcmtokenWeb;
    console.log(
      "[FCM][Delivery] Backend saved fcmTokenWeb:",
      saved ? saved.substring(0, 30) + "..." : "null",
    );
  } catch (error) {
    console.error("[FCM][Delivery] Error during web FCM registration:", error?.message || error);
  }
}

export async function removeFcmTokenForDelivery() {
  try {
    await deliveryAPI.removeFcmToken("web");
  } catch (error) {
    console.error("[FCM][Delivery] Error removing FCM token for web:", error);
  }
}

let foregroundUnsubscribe = null;
let foregroundInitialized = false;

/**
 * Listen for FCM messages while the app tab is in the foreground.
 * Shows an in-app toast via sonner. Call once per layout mount.
 * Returns an unsubscribe function.
 */
export async function setupForegroundNotifications() {
  try {
    if (foregroundInitialized && foregroundUnsubscribe) return foregroundUnsubscribe;

    const app = await ensureFirebaseInitialized();
    if (!app) return () => {};

    const supported = await isSupported();
    if (!supported) return () => {};

    const messaging = getMessaging(app);
    foregroundUnsubscribe = onMessage(messaging, (payload) => {
      console.log("[FCM] Foreground message received:", payload);
      const title = payload?.notification?.title || payload?.data?.title || "TruOrder";
      const body = payload?.notification?.body || payload?.data?.body || "";
      const icon = payload?.notification?.icon || payload?.data?.icon || "/favicon.ico";
      const tag = payload?.data?.tag || payload?.data?.orderId || title;

      // Cross-tab dedupe to avoid duplicate OS notifications.
      const debounceKey = `fcm_notif_shown_${tag}`;
      const lastShown = localStorage.getItem(debounceKey);
      if (!lastShown || Date.now() - parseInt(lastShown, 10) >= 5000) {
        localStorage.setItem(debounceKey, Date.now().toString());
        try {
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(title, {
              body,
              icon,
              tag,
              data: payload?.data || {},
            });
          }
        } catch {
          // Ignore browser notification failures.
        }
      }

      toast.success(title, {
        description: body,
        duration: 6000,
        position: "top-right",
        style: {
          background: "#1a1a2e",
          color: "#ffffff",
          border: "1px solid #FF6B35",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 8px 32px rgba(255, 107, 53, 0.25)",
        },
      });
    });
    foregroundInitialized = true;

    return foregroundUnsubscribe;
  } catch (err) {
    console.warn("[FCM] Could not set up foreground handler:", err?.message || err);
    return () => {};
  }
}

// App-level initializer (bakalacart-style): set up SW + single foreground listener.
export async function initializePushNotifications() {
  try {
    await setupForegroundNotifications();
  } catch {
    // Non-critical: do not block app startup.
  }
}

