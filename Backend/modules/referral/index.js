import express from "express";
import referralRoutes from "./routes/referralRoutes.js";

const router = express.Router();

router.use("/referral", referralRoutes);

export default router;
