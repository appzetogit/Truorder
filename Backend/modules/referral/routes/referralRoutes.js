import express from "express";
import Joi from "joi";
import { validate } from "../../../shared/middleware/validate.js";
import { verifyCode } from "../controllers/referralController.js";

const router = express.Router();

const verifySchema = Joi.object({
  code: Joi.string().trim().required(),
  type: Joi.string().valid("delivery_partner", "restaurant").required(),
});

router.post("/verify", validate(verifySchema), verifyCode);

export default router;
