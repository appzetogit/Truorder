import jwtService from '../../auth/services/jwtService.js';
import Admin from '../models/Admin.js';
import Hub from "../models/Hub.js";
import HubZone from "../models/HubZone.js";
import { errorResponse } from '../../../shared/utils/response.js';

/**
 * Admin Authentication Middleware
 * Verifies JWT access token and attaches admin or hub manager to request
 */
export const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from Authorization header (case-insensitive check)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwtService.verifyAccessToken(token);

    // Ensure token is for admin role
    if (decoded.role !== 'admin') {
      return errorResponse(res, 403, 'Access denied. Admin access required.');
    }

    if (decoded.hubRole === "hub_manager") {
      const hub = await Hub.findById(decoded.userId).select("-password");

      if (!hub) {
        return errorResponse(res, 401, "Hub not found");
      }

      if (hub.status !== "active") {
        return errorResponse(res, 401, "Hub account is inactive");
      }

      const hubZones = await HubZone.find({ hubId: hub._id })
        .select("zoneId")
        .lean();
      const assignedZoneIds = hubZones.map((hubZone) =>
        hubZone.zoneId.toString(),
      );

      req.user = {
        _id: hub._id,
        userId: hub._id.toString(),
        role: "hub_manager",
        hubRole: "hub_manager",
        email: hub.email,
        hubName: hub.hubName,
        managerName: hub.managerName,
        assignedZoneIds,
      };
      req.admin = req.user;
      req.token = decoded;
      req.isHubManager = true;
      return next();
    }

    // Get admin from database
    const admin = await Admin.findById(decoded.userId).select('-password');
    
    if (!admin) {
      return errorResponse(res, 401, 'Admin not found');
    }

    if (!admin.isActive) {
      return errorResponse(res, 401, 'Admin account is inactive');
    }

    // Attach admin to request (both req.user and req.admin for compatibility)
    req.user = admin;
    req.admin = admin; // Also set req.admin for consistency
    req.token = decoded;
    req.isHubManager = false;
    
    next();
  } catch (error) {
    return errorResponse(res, 401, error.message || 'Invalid token');
  }
};

/**
 * Admin Role Authorization Middleware
 * @param {...string} roles - Allowed admin roles (super_admin, admin, moderator, hub_manager)
 */
export const authorizeAdmin = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required');
    }

    const userRole = req.user.role || req.user.hubRole;

    if (!roles.includes(userRole)) {
      return errorResponse(res, 403, 'Access denied. Insufficient permissions.');
    }

    next();
  };
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 401, "Authentication required");
  }

  if (req.isHubManager || req.user.role === "hub_manager") {
    return errorResponse(res, 403, "Access denied. Super Admin only.");
  }

  if (req.user.role !== "super_admin") {
    return errorResponse(res, 403, "Access denied. Super Admin only.");
  }

  next();
};

export const applyHubZoneFilter = (req, res, next) => {
  if (!req.isHubManager || !req.user?.assignedZoneIds?.length) {
    req.zoneFilter = null;
    return next();
  }

  req.zoneFilter = { zoneIds: req.user.assignedZoneIds };
  next();
};

export default {
  authenticateAdmin,
  authorizeAdmin,
  requireSuperAdmin,
  applyHubZoneFilter,
};

