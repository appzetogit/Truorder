/**
 * FCM Push Notification Service
 * Sends push notifications via Firebase Cloud Messaging (Firebase Admin SDK)
 */

import admin from "firebase-admin";
import User from "../../modules/auth/models/User.js";
import Delivery from "../../modules/delivery/models/Delivery.js";
import Restaurant from "../../modules/restaurant/models/Restaurant.js";
import Zone from "../../modules/admin/models/Zone.js";

/**
 * Collect FCM tokens from entities based on sendTo and zone
 * @param {string} sendTo - "Customer" | "Delivery Man" | "Restaurant"
 * @param {string} zone - "All" | zone name (e.g. "Asia", "Europe")
 * @returns {Promise<string[]>} Array of valid FCM tokens
 */
async function getFcmTokens(sendTo, zone) {
  const tokens = new Set();

  const addTokens = (entity) => {
    if (entity?.fcmTokenWeb) tokens.add(entity.fcmTokenWeb);
    if (entity?.fcmTokenAndroid) tokens.add(entity.fcmTokenAndroid);
    if (entity?.fcmTokenIos) tokens.add(entity.fcmTokenIos);
  };

  if (sendTo === "Customer") {
    const query = { role: "user" };
    const users = await User.find(query)
      .select("fcmTokenWeb fcmTokenAndroid fcmTokenIos")
      .lean();
    users.forEach(addTokens);
  } else if (sendTo === "Delivery Man") {
    let query = { status: "approved" };
    if (zone && zone !== "All") {
      const zoneDoc = await Zone.findOne({ name: zone }).select("_id").lean();
      if (zoneDoc) {
        query["availability.zones"] = zoneDoc._id;
      }
    }
    const deliveries = await Delivery.find(query)
      .select("fcmTokenWeb fcmTokenAndroid fcmTokenIos")
      .lean();
    deliveries.forEach(addTokens);
  } else if (sendTo === "Restaurant") {
    const query = { status: "approved" };
    const restaurants = await Restaurant.find(query)
      .select("fcmTokenWeb fcmTokenAndroid fcmTokenIos")
      .lean();
    restaurants.forEach(addTokens);
  }

  return [...tokens].filter(Boolean);
}

/**
 * Send FCM message to a single token
 * @param {string} token - FCM device token
 * @param {Object} payload - { title, body, image? }
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendToToken(token, payload) {
  try {
    if (!admin.apps.length) {
      return { success: false, error: "Firebase Admin not initialized" };
    }

    const { title, body, image } = payload;
    const message = {
      token,
      notification: {
        title: title || "TruOrder",
        body: body || "",
        ...(image && { image }),
      },
      webpush: {
        notification: {
          title: title || "TruOrder",
          body: body || "",
          icon: "/notification-icon.png",
          badge: "/notification-icon.png",
          ...(image && { image }),
          requireInteraction: false,
          vibrate: [200, 100, 200],
          actions: [
            { action: "open", title: "View" },
            { action: "dismiss", title: "Dismiss" },
          ],
        },
        fcmOptions: {
          link: "/",
        },
      },
      android: {
        notification: {
          title: title || "TruOrder",
          body: body || "",
          color: "#FF6B35",
          icon: "ic_notification",
          sound: "default",
          channelId: "truorder_orders",
          ...(image && { imageUrl: image }),
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: title || "TruOrder",
              body: body || "",
            },
            sound: "default",
            badge: 1,
          },
        },
        fcmOptions: {
          imageUrl: image || undefined,
        },
      },
    };

    await admin.messaging().send(message);
    return { success: true };
  } catch (err) {
    const errMsg = err?.message || String(err);
    if (
      errMsg.includes("registration-token-not-registered") ||
      errMsg.includes("invalid-registration-token") ||
      errMsg.includes("unregistered")
    ) {
      return { success: false, error: "invalid_token" };
    }
    return { success: false, error: errMsg };
  }
}

/**
 * Send FCM push to a single entity (user/restaurant/delivery) by ID.
 * Silently returns on any failure so it never blocks the caller.
 * @param {"user"|"restaurant"|"delivery"} role
 * @param {string} entityId - MongoDB _id
 * @param {{ title: string, body: string, image?: string, data?: object }} payload
 * @returns {Promise<{ sent: number, failed: number }>}
 */
export async function sendPushToEntity(role, entityId, { title, body, image, data } = {}) {
  const result = { sent: 0, failed: 0 };
  try {
    if (!admin.apps.length || !entityId) return result;

    const select = "fcmTokenWeb fcmTokenAndroid fcmTokenIos";
    let entity;
    if (role === "user") {
      entity = await User.findById(entityId).select(select).lean();
    } else if (role === "restaurant") {
      entity = await Restaurant.findById(entityId).select(select).lean();
    } else if (role === "delivery") {
      entity = await Delivery.findById(entityId).select(select).lean();
    }
    if (!entity) return result;

    const tokens = [entity.fcmTokenWeb, entity.fcmTokenAndroid, entity.fcmTokenIos].filter(Boolean);
    if (tokens.length === 0) return result;

    const msg = { title: title || "Notification", body: body || "", image: image || undefined };
    for (const token of tokens) {
      const res = await sendToToken(token, msg);
      if (res.success) result.sent++;
      else result.failed++;
    }
  } catch (err) {
    console.error(`[FCM] sendPushToEntity(${role}, ${entityId}) error:`, err.message);
  }
  return result;
}

/**
 * Send push notification to target audience
 * @param {Object} params
 * @param {string} params.title - Notification title
 * @param {string} params.description - Notification body/description
 * @param {string} params.sendTo - "Customer" | "Delivery Man" | "Restaurant"
 * @param {string} params.zone - "All" | zone name
 * @param {string} [params.image] - Optional image URL
 * @returns {Promise<{sent: number, failed: number, total: number, errors: string[]}>}
 */
export async function sendPushNotification({
  title,
  description,
  sendTo,
  zone = "All",
  image,
}) {
  const result = { sent: 0, failed: 0, total: 0, errors: [] };

  if (!admin.apps.length) {
    result.errors.push("Firebase Admin not initialized");
    return result;
  }

  const tokens = await getFcmTokens(sendTo, zone);
  result.total = tokens.length;

  if (tokens.length === 0) {
    return result;
  }

  const payload = {
    title: title || "Notification",
    body: description || "",
    image: image || undefined,
  };

  for (const token of tokens) {
    const res = await sendToToken(token, payload);
    if (res.success) {
      result.sent++;
    } else {
      result.failed++;
      if (res.error && res.error !== "invalid_token") {
        result.errors.push(res.error);
      }
    }
  }

  return result;
}
