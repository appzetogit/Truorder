import express from "express";
import {
  sendOTP,
  verifyOTP,
  completeRegistrationWithReferral,
  refreshToken,
  logout,
  getCurrentDelivery,
  registerFcmToken,
  removeFcmToken,
} from "../controllers/deliveryAuthController.js";
import { authenticate } from "../middleware/deliveryAuth.js";
import { validate } from "../../../shared/middleware/validate.js";
import Joi from "joi";

const router = express.Router();

// Validation schemas
const sendOTPSchema = Joi.object({
  phone: Joi.string()
    .pattern(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    )
    .required(),
  purpose: Joi.string()
    .valid("login", "register", "reset-password", "verify-phone")
    .default("login"),
});

const verifyOTPSchema = Joi.object({
  phone: Joi.string()
    .pattern(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    )
    .required(),
  otp: Joi.string().required().length(6),
  purpose: Joi.string()
    .valid("login", "register", "reset-password", "verify-phone")
    .default("login"),
  name: Joi.string().allow(null, "").optional(),
});

const completeRegistrationSchema = Joi.object({
  tempToken: Joi.string().required(),
  referralCode: Joi.string().trim().required(),
});

const fcmTokenSchema = Joi.object({
  platform: Joi.string().valid("web", "android", "ios", "app", "mobile", "windows").required(),
  fcmToken: Joi.string().optional(),
  token: Joi.string().optional(),
}).or("fcmToken", "token");

const fcmTokenDeleteSchema = Joi.object({
  platform: Joi.string().valid("web", "android", "ios", "app", "mobile", "windows").required(),
});

// Public routes
router.post("/send-otp", validate(sendOTPSchema), sendOTP);
router.post("/verify-otp", validate(verifyOTPSchema), verifyOTP);
router.post("/complete-registration-with-referral", validate(completeRegistrationSchema), completeRegistrationWithReferral);
router.post("/refresh-token", refreshToken);

// Protected routes (require authentication)
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getCurrentDelivery);
router.post("/fcm-token", authenticate, validate(fcmTokenSchema), registerFcmToken);
router.delete("/fcm-token", authenticate, validate(fcmTokenDeleteSchema), removeFcmToken);

export default router;
