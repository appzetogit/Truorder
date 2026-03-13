import ReferralCode from "../models/ReferralCode.js";

/**
 * Validate referral code for given type
 * @param {string} code - Referral code
 * @param {string} type - 'delivery_partner' or 'restaurant'
 * @returns {{ valid: boolean, message?: string, referralCode?: object }}
 */
export async function verifyReferralCode(code, type) {
  if (!code || !type) {
    return { valid: false, message: "Code and type are required" };
  }

  const normalizedCode = String(code).trim().toUpperCase();
  if (!normalizedCode) {
    return { valid: false, message: "Invalid referral code" };
  }

  const validTypes = ["delivery_partner", "restaurant"];
  if (!validTypes.includes(type)) {
    return { valid: false, message: "Invalid type" };
  }

  const referralCode = await ReferralCode.findOne({
    code: normalizedCode,
    type,
  });

  if (!referralCode) {
    return { valid: false, message: "Referral code not found" };
  }

  if (referralCode.status !== "active") {
    return { valid: false, message: "Referral code is inactive" };
  }

  if (referralCode.expiryDate && new Date() > referralCode.expiryDate) {
    return { valid: false, message: "Referral code has expired" };
  }

  if (
    referralCode.usageLimit !== null &&
    referralCode.usedCount >= referralCode.usageLimit
  ) {
    return { valid: false, message: "Referral code usage limit reached" };
  }

  return { valid: true, referralCode };
}

/**
 * Increment used count for a referral code
 * @param {string} referralCodeId - MongoDB ObjectId of the referral code
 */
export async function incrementReferralUsage(referralCodeId) {
  await ReferralCode.findByIdAndUpdate(referralCodeId, {
    $inc: { usedCount: 1 },
  });
}
