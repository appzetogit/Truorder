import ReferralCode from "../../referral/models/ReferralCode.js";
import {
  successResponse,
  errorResponse,
} from "../../../shared/utils/response.js";
import { asyncHandler } from "../../../shared/middleware/asyncHandler.js";
import Joi from "joi";

/**
 * Create referral code
 * POST /admin/referral/create
 */
export const createReferralCode = asyncHandler(async (req, res) => {
  const { code, type, usageLimit, expiryDate, status } = req.body;

  const schema = Joi.object({
    code: Joi.string().trim().required().min(3).max(50),
    type: Joi.string().valid("delivery_partner", "restaurant").required(),
    usageLimit: Joi.number().integer().min(1).allow(null).optional(),
    expiryDate: Joi.date().allow(null).optional(),
    status: Joi.string().valid("active", "inactive").default("active"),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return errorResponse(res, 400, error.details[0].message);
  }

  const normalizedCode = value.code.trim().toUpperCase();

  const existing = await ReferralCode.findOne({
    code: normalizedCode,
    type: value.type,
  });
  if (existing) {
    return errorResponse(res, 400, "Referral code already exists for this type");
  }

  const referralCode = await ReferralCode.create({
    code: normalizedCode,
    type: value.type,
    usageLimit: value.usageLimit ?? null,
    expiryDate: value.expiryDate ?? null,
    status: value.status || "active",
  });

  return successResponse(res, 201, "Referral code created successfully", {
    referralCode: {
      id: referralCode._id,
      code: referralCode.code,
      type: referralCode.type,
      usageLimit: referralCode.usageLimit,
      usedCount: referralCode.usedCount,
      expiryDate: referralCode.expiryDate,
      status: referralCode.status,
      createdAt: referralCode.createdAt,
    },
  });
});

/**
 * Get referral codes list
 * GET /admin/referral/list
 */
export const getReferralCodes = asyncHandler(async (req, res) => {
  const { type, status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (type) query.type = type;
  if (status) query.status = status;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const [codes, total] = await Promise.all([
    ReferralCode.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)).lean(),
    ReferralCode.countDocuments(query),
  ]);

  return successResponse(res, 200, "Referral codes fetched successfully", {
    codes,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10)),
    },
  });
});

/**
 * Update referral code status
 * PUT /admin/referral/status
 */
export const updateReferralCodeStatus = asyncHandler(async (req, res) => {
  const { id, status } = req.body;

  if (!id || !status) {
    return errorResponse(res, 400, "Id and status are required");
  }

  if (!["active", "inactive"].includes(status)) {
    return errorResponse(res, 400, "Status must be active or inactive");
  }

  const referralCode = await ReferralCode.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!referralCode) {
    return errorResponse(res, 404, "Referral code not found");
  }

  return successResponse(res, 200, "Status updated successfully", {
    referralCode: {
      id: referralCode._id,
      code: referralCode.code,
      type: referralCode.type,
      status: referralCode.status,
    },
  });
});

/**
 * Delete referral code
 * DELETE /admin/referral/:id
 */
export const deleteReferralCode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const referralCode = await ReferralCode.findByIdAndDelete(id);

  if (!referralCode) {
    return errorResponse(res, 404, "Referral code not found");
  }

  return successResponse(res, 200, "Referral code deleted successfully");
});
