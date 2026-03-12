import Hub from '../models/Hub.js';
import HubZone from '../models/HubZone.js';
import Zone from '../models/Zone.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import { asyncHandler } from '../../../shared/middleware/asyncHandler.js';
import mongoose from 'mongoose';

/**
 * Get all hubs (Super Admin only)
 * GET /api/admin/hubs
 */
export const getHubs = asyncHandler(async (req, res) => {
  const hubs = await Hub.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const hubsWithZones = await Promise.all(
    hubs.map(async (hub) => {
      const hubZones = await HubZone.find({ hubId: hub._id })
        .populate('zoneId', 'name zoneName serviceLocation')
        .lean();
      return {
        ...hub,
        assignedZones: hubZones.map((hz) => ({
          _id: hz.zoneId._id,
          name: hz.zoneId.name || hz.zoneId.zoneName || hz.zoneId.serviceLocation,
        })),
      };
    })
  );

  return successResponse(res, 200, 'Hubs retrieved successfully', {
    hubs: hubsWithZones,
  });
});

/**
 * Get hub by ID
 * GET /api/admin/hubs/:id
 */
export const getHubById = asyncHandler(async (req, res) => {
  const hub = await Hub.findById(req.params.id)
    .populate('createdBy', 'name email')
    .lean();

  if (!hub) {
    return errorResponse(res, 404, 'Hub not found');
  }

  const hubZones = await HubZone.find({ hubId: hub._id })
    .populate('zoneId', 'name zoneName serviceLocation')
    .lean();

  return successResponse(res, 200, 'Hub retrieved successfully', {
    hub: {
      ...hub,
      assignedZones: hubZones.map((hz) => ({
        _id: hz.zoneId._id,
        name: hz.zoneId.name || hz.zoneId.zoneName || hz.zoneId.serviceLocation,
      })),
    },
  });
});

/**
 * Create hub (Super Admin only)
 * POST /api/admin/hubs
 */
export const createHub = asyncHandler(async (req, res) => {
  const { hubName, managerName, email, phone, password, confirmPassword, zoneIds, status } = req.body;

  if (!hubName || !managerName || !email || !password) {
    return errorResponse(res, 400, 'Hub name, manager name, email, and password are required');
  }

  if (password !== confirmPassword) {
    return errorResponse(res, 400, 'Password and confirm password do not match');
  }

  if (password.length < 6) {
    return errorResponse(res, 400, 'Password must be at least 6 characters long');
  }

  if (!zoneIds || !Array.isArray(zoneIds) || zoneIds.length === 0) {
    return errorResponse(res, 400, 'At least one zone must be assigned');
  }

  const existingHub = await Hub.findOne({ email: email.toLowerCase() });
  if (existingHub) {
    return errorResponse(res, 400, 'Hub with this email already exists');
  }

  const validZoneIds = zoneIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const zonesExist = await Zone.countDocuments({ _id: { $in: validZoneIds }, isActive: true });
  if (zonesExist !== validZoneIds.length) {
    return errorResponse(res, 400, 'One or more zones are invalid or inactive');
  }

  const hub = await Hub.create({
    hubName: hubName.trim(),
    managerName: managerName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone?.trim() || '',
    password,
    status: status === 'inactive' ? 'inactive' : 'active',
    createdBy: req.user._id,
  });

  await HubZone.insertMany(
    validZoneIds.map((zoneId) => ({
      hubId: hub._id,
      zoneId,
    }))
  );

  const hubResponse = hub.toObject();
  delete hubResponse.password;

  return successResponse(res, 201, 'Hub created successfully', {
    hub: hubResponse,
  });
});

/**
 * Update hub
 * PUT /api/admin/hubs/:id
 */
export const updateHub = asyncHandler(async (req, res) => {
  const { hubName, managerName, phone, status } = req.body;

  const hub = await Hub.findById(req.params.id);
  if (!hub) {
    return errorResponse(res, 404, 'Hub not found');
  }

  if (hubName) hub.hubName = hubName.trim();
  if (managerName) hub.managerName = managerName.trim();
  if (phone !== undefined) hub.phone = phone?.trim() || '';
  if (status) hub.status = status === 'inactive' ? 'inactive' : 'active';

  await hub.save();

  const hubResponse = hub.toObject();
  delete hubResponse.password;

  return successResponse(res, 200, 'Hub updated successfully', {
    hub: hubResponse,
  });
});

/**
 * Update hub assigned zones
 * PUT /api/admin/hubs/:id/zones
 */
export const updateHubZones = asyncHandler(async (req, res) => {
  const { zoneIds } = req.body;

  if (!zoneIds || !Array.isArray(zoneIds) || zoneIds.length === 0) {
    return errorResponse(res, 400, 'At least one zone must be assigned');
  }

  const hub = await Hub.findById(req.params.id);
  if (!hub) {
    return errorResponse(res, 404, 'Hub not found');
  }

  const validZoneIds = zoneIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const zonesExist = await Zone.countDocuments({ _id: { $in: validZoneIds }, isActive: true });
  if (zonesExist !== validZoneIds.length) {
    return errorResponse(res, 400, 'One or more zones are invalid or inactive');
  }

  await HubZone.deleteMany({ hubId: hub._id });
  await HubZone.insertMany(
    validZoneIds.map((zoneId) => ({
      hubId: hub._id,
      zoneId,
    }))
  );

  return successResponse(res, 200, 'Hub zones updated successfully');
});

/**
 * Reset hub password
 * POST /api/admin/hubs/:id/reset-password
 */
export const resetHubPassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return errorResponse(res, 400, 'Password and confirm password are required');
  }

  if (password !== confirmPassword) {
    return errorResponse(res, 400, 'Password and confirm password do not match');
  }

  if (password.length < 6) {
    return errorResponse(res, 400, 'Password must be at least 6 characters long');
  }

  const hub = await Hub.findById(req.params.id).select('+password');
  if (!hub) {
    return errorResponse(res, 404, 'Hub not found');
  }

  hub.password = password;
  await hub.save();

  return successResponse(res, 200, 'Hub password reset successfully');
});

/**
 * Disable hub (set status to inactive)
 * PATCH /api/admin/hubs/:id/disable
 */
export const disableHub = asyncHandler(async (req, res) => {
  const hub = await Hub.findById(req.params.id);
  if (!hub) {
    return errorResponse(res, 404, 'Hub not found');
  }

  hub.status = 'inactive';
  await hub.save();

  return successResponse(res, 200, 'Hub disabled successfully');
});

/**
 * Enable hub (set status to active)
 * PATCH /api/admin/hubs/:id/enable
 */
export const enableHub = asyncHandler(async (req, res) => {
  const hub = await Hub.findById(req.params.id);
  if (!hub) {
    return errorResponse(res, 404, 'Hub not found');
  }

  hub.status = 'active';
  await hub.save();

  return successResponse(res, 200, 'Hub enabled successfully');
});

/**
 * Get current hub profile (Hub Manager only)
 * GET /api/admin/hub/me
 */
export const getCurrentHubProfile = asyncHandler(async (req, res) => {
  if (!req.isHubManager || !req.user?.userId) {
    return errorResponse(res, 403, 'Access denied. Hub manager access required.');
  }

  const hub = await Hub.findById(req.user.userId).select('-password').lean();
  if (!hub) {
    return errorResponse(res, 404, 'Hub not found');
  }

  const hubZones = await HubZone.find({ hubId: hub._id })
    .populate('zoneId', 'name zoneName serviceLocation')
    .lean();

  const assignedZones = hubZones.map((hz) => ({
    _id: hz.zoneId?._id,
    name: hz.zoneId?.name || hz.zoneId?.zoneName || hz.zoneId?.serviceLocation,
  })).filter((z) => z._id);

  return successResponse(res, 200, 'Hub profile retrieved successfully', {
    hub: {
      ...hub,
      assignedZones,
    },
  });
});

/**
 * Update current hub profile (Hub Manager only)
 * PUT /api/admin/hub/me
 */
export const updateCurrentHubProfile = asyncHandler(async (req, res) => {
  if (!req.isHubManager || !req.user?.userId) {
    return errorResponse(res, 403, 'Access denied. Hub manager access required.');
  }

  const { managerName, phone } = req.body;

  const hub = await Hub.findById(req.user.userId);
  if (!hub) {
    return errorResponse(res, 404, 'Hub not found');
  }

  if (managerName) hub.managerName = managerName.trim();
  if (phone !== undefined) hub.phone = phone?.trim() || '';

  await hub.save();

  const hubResponse = hub.toObject();
  delete hubResponse.password;

  return successResponse(res, 200, 'Hub profile updated successfully', {
    hub: hubResponse,
  });
});

/**
 * Change current hub password (Hub Manager only)
 * POST /api/admin/hub/me/change-password
 */
export const changeCurrentHubPassword = asyncHandler(async (req, res) => {
  if (!req.isHubManager || !req.user?.userId) {
    return errorResponse(res, 403, 'Access denied. Hub manager access required.');
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return errorResponse(res, 400, 'Current password, new password and confirm password are required');
  }

  if (newPassword !== confirmPassword) {
    return errorResponse(res, 400, 'New password and confirm password do not match');
  }

  if (newPassword.length < 6) {
    return errorResponse(res, 400, 'New password must be at least 6 characters long');
  }

  const hub = await Hub.findById(req.user.userId).select('+password');
  if (!hub) {
    return errorResponse(res, 404, 'Hub not found');
  }

  const isMatch = await hub.comparePassword(currentPassword);
  if (!isMatch) {
    return errorResponse(res, 400, 'Current password is incorrect');
  }

  hub.password = newPassword;
  await hub.save();

  return successResponse(res, 200, 'Password changed successfully');
});

