import { asyncHandler } from "../../../shared/middleware/asyncHandler.js";
import {
  errorResponse,
  successResponse,
} from "../../../shared/utils/response.js";
import { verifyTrulifeReferral } from "../services/trulifeService.js";

export const verifyCode = asyncHandler(async (req, res) => {
  const { code, type } = req.body;

  if (!code || !type) {
    return errorResponse(res, 400, "Code and type are required");
  }

  const trulifeResult = await verifyTrulifeReferral(code.trim());
  if (!trulifeResult.valid) {
    return successResponse(res, 200, "Invalid Referral Code", {
      valid: false,
      message: trulifeResult.message || "Invalid Referral Code",
    });
  }

  return successResponse(res, 200, "Referral code is valid", {
    valid: true,
    sponsorName: trulifeResult.sponsorName,
  });
});
