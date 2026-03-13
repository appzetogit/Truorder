import axios from "axios";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

const TRULIFE_BASE_URL = "https://trulifeindia.com/api/User/users";
const TRULIFE_TIMEOUT = 10000; // 10 seconds

const trulifeClient = axios.create({
  baseURL: TRULIFE_BASE_URL,
  timeout: TRULIFE_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

/**
 * Verify referral code against Trulife API
 * @param {string} refId - The referral code to verify
 * @returns {{ valid: boolean, sponsorName?: string, message?: string, data?: object }}
 */
export async function verifyTrulifeReferral(refId) {
  if (!refId || !String(refId).trim()) {
    return { valid: false, message: "Referral code is required" };
  }

  const code = String(refId).trim();

  try {
    const response = await trulifeClient.get(
      `/get-member-details-by-ref/${encodeURIComponent(code)}`
    );

    const data = response.data;

    if (data && data.fullName) {
      return {
        valid: true,
        sponsorName: data.fullName,
        data,
      };
    }

    if (data && data.status === true && data.data) {
      const member = data.data;
      return {
        valid: true,
        sponsorName: member.fullName || member.name || "Sponsor",
        data: member,
      };
    }

    return { valid: false, message: "Invalid Referral Code" };
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 404 || status === 400) {
        return { valid: false, message: "Invalid Referral Code" };
      }
      logger.error(
        `Trulife verify API error: ${status} - ${JSON.stringify(error.response.data)}`
      );
      return { valid: false, message: "Invalid Referral Code" };
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      logger.error("Trulife verify API timeout");
      return {
        valid: false,
        message: "Verification service is temporarily unavailable. Please try again.",
      };
    }

    logger.error(`Trulife verify API error: ${error.message}`);
    return {
      valid: false,
      message: "Unable to verify referral code. Please try again.",
    };
  }
}

/**
 * Register affiliate with Trulife after TruOrder registration completes.
 * Failures are logged but never block TruOrder registration.
 * @param {object} params
 * @param {string} params.referralCode
 * @param {string} params.fullName
 * @param {string} params.email
 * @param {string} params.mobileNo
 * @param {string} params.state
 * @param {string} params.city
 * @param {string} params.role - 'delivery_partner' or 'restaurant'
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
export async function registerTrulifeAffiliate({
  referralCode,
  fullName,
  email,
  mobileNo,
  state,
  city,
  role,
}) {
  const payload = {
    referralCode: referralCode || "",
    fullName: fullName || "",
    email: email || "",
    mobileNo: String(mobileNo || "").replace(/^\+91/, ""),
    state: state || "",
    city: city || "",
    loginId: String(mobileNo || "").replace(/^\+91/, ""),
    password: String(mobileNo || "").replace(/^\+91/, ""),
    source: "TruOrder",
    role: role || "delivery_partner",
  };

  try {
    console.log("\n========== TRULIFE AFFILIATE REGISTRATION ==========");
    console.log("Sending data to: POST https://trulifeindia.com/api/User/users/registeraffiliate");
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log("====================================================\n");

    const response = await trulifeClient.post("/registeraffiliate", payload);

    console.log("\n========== TRULIFE AFFILIATE - SUCCESS ==========");
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(response.data, null, 2));
    console.log("=================================================\n");

    return { success: true, data: response.data };
  } catch (error) {
    const errMsg = error.response
      ? `${error.response.status} - ${JSON.stringify(error.response.data)}`
      : error.message;

    console.log("\n========== TRULIFE AFFILIATE - FAILED ==========");
    console.log("Error:", errMsg);
    console.log("Payload was:", JSON.stringify(payload, null, 2));
    console.log("================================================\n");

    return { success: false, error: errMsg };
  }
}
