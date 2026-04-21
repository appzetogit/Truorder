import axios from "axios";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const trulifeClient = axios.create({
  baseURL: "https://trulifeindia.com/api/User/users",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export async function verifyTrulifeReferral(refId) {
  if (!refId || !String(refId).trim()) {
    return { valid: false, message: "Referral code is required" };
  }

  const code = String(refId).trim();

  try {
    const response = await trulifeClient.get(
      `/get-member-details-by-ref/${encodeURIComponent(code)}`,
    );
    const data = response.data;

    if (data && data.fullName) {
      return { valid: true, sponsorName: data.fullName, data };
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
        `Trulife verify API error: ${status} - ${JSON.stringify(error.response.data)}`,
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

export async function registerTrulifeAffiliate({
  referralCode,
  fullName,
  email,
  mobileNo,
  state,
  city,
  role,
}) {
  const normalizedMobile = String(mobileNo || "")
    .replace(/^\+91/, "")
    .trim();

  const payload = {
    referralCode: referralCode || "",
    fullName: fullName || "",
    email: email || "",
    mobileNo: normalizedMobile,
    state: state || "",
    city: city || "",
    loginId: normalizedMobile,
    password: normalizedMobile,
    source: "TruOrder",
    role: role || "delivery_partner",
  };

  try {
    const response = await trulifeClient.post("/registeraffiliate", payload);
    return { success: true, data: response.data };
  } catch (error) {
    const errMsg = error.response
      ? `${error.response.status} - ${JSON.stringify(error.response.data)}`
      : error.message;

    logger.error(`Trulife affiliate registration failed: ${errMsg}`);
    return { success: false, error: errMsg };
  }
}
