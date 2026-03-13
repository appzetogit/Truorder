import express from "express";
import {
  createReferralCode,
  getReferralCodes,
  updateReferralCodeStatus,
  deleteReferralCode,
} from "../controllers/referralCodeController.js";

const router = express.Router();

router.post("/create", createReferralCode);
router.get("/list", getReferralCodes);
router.put("/status", updateReferralCodeStatus);
router.delete("/:id", deleteReferralCode);

export default router;
