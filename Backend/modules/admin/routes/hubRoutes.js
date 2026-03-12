import express from 'express';
import {
  getHubs,
  getHubById,
  createHub,
  updateHub,
  updateHubZones,
  resetHubPassword,
  disableHub,
  enableHub,
} from '../controllers/hubController.js';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/adminAuth.js';
import { validate } from '../../../shared/middleware/validate.js';
import Joi from 'joi';

const router = express.Router();

// Hub management is Super Admin only (authenticateAdmin already applied by parent)
router.use(requireSuperAdmin);

const createHubSchema = Joi.object({
  hubName: Joi.string().required().min(2).max(100),
  managerName: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required().lowercase(),
  phone: Joi.string().optional().allow(''),
  password: Joi.string().required().min(6).max(100),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  zoneIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  status: Joi.string().valid('active', 'inactive').optional(),
});

const updateHubSchema = Joi.object({
  hubName: Joi.string().min(2).max(100).optional(),
  managerName: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().optional().allow(''),
  status: Joi.string().valid('active', 'inactive').optional(),
});

const updateZonesSchema = Joi.object({
  zoneIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().required().min(6).max(100),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
});

router.get('/', getHubs);
router.get('/:id', getHubById);
router.post('/', validate(createHubSchema), createHub);
router.put('/:id', validate(updateHubSchema), updateHub);
router.put('/:id/zones', validate(updateZonesSchema), updateHubZones);
router.post('/:id/reset-password', validate(resetPasswordSchema), resetHubPassword);
router.patch('/:id/disable', disableHub);
router.patch('/:id/enable', enableHub);

export default router;
