import express from "express";
import { verifyCode } from "../controllers/referralController.js";
import Joi from "joi";
import { validate } from "../../../shared/middleware/validate.js";

const router = express.Router();

const verifySchema = Joi.object({
  code: Joi.string().trim().required(),
  type: Joi.string()
    .valid("delivery_partner", "restaurant")
    .required(),
});

router.post("/verify", validate(verifySchema), verifyCode);

export default router;
