import { asyncHandler } from "../../../shared/middleware/asyncHandler.js";
import { successResponse, errorResponse } from "../../../shared/utils/response.js";
import Restaurant from "../models/Restaurant.js";

/**
 * Register or refresh FCM device token for the currently authenticated restaurant
 * POST /api/restaurant/auth/fcm-token
 * Body: { platform: 'web' | 'android' | 'ios', fcmToken }
 */
export const registerRestaurantFcmToken = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  const { platform, fcmToken, token } = req.body;
  const normalizedPlatform = platform === "app" ? "android" : platform;
  const normalizedToken = fcmToken || token;

  if (!normalizedPlatform || !normalizedToken) {
    return errorResponse(
      res,
      400,
      "platform and fcmToken/token are required",
    );
  }

  const validPlatforms = ["web", "android", "ios"];
  if (!validPlatforms.includes(normalizedPlatform)) {
    return errorResponse(
      res,
      400,
      "Invalid platform. Allowed values: web, android, ios, app",
    );
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return errorResponse(res, 404, "Restaurant not found");
  }

  if (normalizedPlatform === "web") {
    restaurant.fcmTokenWeb = normalizedToken;
  } else if (normalizedPlatform === "android") {
    restaurant.fcmTokenAndroid = normalizedToken;
  } else if (normalizedPlatform === "ios") {
    restaurant.fcmTokenIos = normalizedToken;
  }

  await restaurant.save();
  return successResponse(res, 200, "FCM token registered successfully", {
    fcmTokenWeb: restaurant.fcmTokenWeb,
    fcmTokenAndroid: restaurant.fcmTokenAndroid,
    fcmTokenIos: restaurant.fcmTokenIos,
  });
});

/**
 * Remove FCM token for the current restaurant device on logout
 * DELETE /api/restaurant/auth/fcm-token
 * Body: { platform: 'web' | 'android' | 'ios' }
 */
export const removeRestaurantFcmToken = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurant?._id;
  const { platform } = req.body;
  const normalizedPlatform = platform === "app" ? "android" : platform;

  if (!normalizedPlatform) {
    return errorResponse(res, 400, "platform is required");
  }

  const validPlatforms = ["web", "android", "ios"];
  if (!validPlatforms.includes(normalizedPlatform)) {
    return errorResponse(
      res,
      400,
      "Invalid platform. Allowed values: web, android, ios, app",
    );
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return errorResponse(res, 404, "Restaurant not found");
  }

  if (normalizedPlatform === "web") {
    restaurant.fcmTokenWeb = null;
  } else if (normalizedPlatform === "android") {
    restaurant.fcmTokenAndroid = null;
  } else if (normalizedPlatform === "ios") {
    restaurant.fcmTokenIos = null;
  }

  await restaurant.save();

  return successResponse(res, 200, "FCM token removed successfully");
});

