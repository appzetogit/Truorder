import jwtService from '../../auth/services/jwtService.js';
import Admin from '../models/Admin.js';
import Hub from '../models/Hub.js';
import HubZone from '../models/HubZone.js';
import { errorResponse } from '../../../shared/utils/response.js';

/**
 * Admin Authentication Middleware
 * Verifies JWT access token and attaches admin or hub to request
 * Supports both Admin and Hub Manager (hub_manager) login
 */
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = jwtService.verifyAccessToken(token);

    if (decoded.role !== 'admin') {
      return errorResponse(res, 403, 'Access denied. Admin access required.');
    }

    // Hub Manager: token has hubRole = 'hub_manager'
    if (decoded.hubRole === 'hub_manager') {
      const hub = await Hub.findById(decoded.userId).select('-password');
      if (!hub) {
        return errorResponse(res, 401, 'Hub not found');
      }
      if (hub.status !== 'active') {
        return errorResponse(res, 401, 'Hub account is inactive');
      }
      const hubZones = await HubZone.find({ hubId: hub._id }).select('zoneId').lean();
      const assignedZoneIds = hubZones.map((hz) => hz.zoneId.toString());

      req.user = {
        _id: hub._id,
        userId: hub._id.toString(),
        role: 'hub_manager',
        hubRole: 'hub_manager',
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

    // Regular Admin
    const admin = await Admin.findById(decoded.userId).select('-password');
    if (!admin) {
      return errorResponse(res, 401, 'Admin not found');
    }
    if (!admin.isActive) {
      return errorResponse(res, 401, 'Admin account is inactive');
    }

    req.user = admin;
    req.admin = admin;
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

/**
 * Restrict route to Super Admin only (Hub management, system settings, etc.)
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 401, 'Authentication required');
  }
  if (req.isHubManager || req.user.role === 'hub_manager') {
    return errorResponse(res, 403, 'Access denied. Super Admin only.');
  }
  if (req.user.role !== 'super_admin') {
    return errorResponse(res, 403, 'Access denied. Super Admin only.');
  }
  next();
};

/**
 * Zone filter middleware - adds req.zoneFilter for hub managers
 * Must run after authenticateAdmin when req.isHubManager is true
 */
export const applyHubZoneFilter = (req, res, next) => {
  if (!req.isHubManager || !req.user?.assignedZoneIds?.length) {
    req.zoneFilter = null;
    return next();
  }
  req.zoneFilter = { zoneIds: req.user.assignedZoneIds };
  next();
};

export default { authenticateAdmin, authorizeAdmin, requireSuperAdmin, applyHubZoneFilter };

