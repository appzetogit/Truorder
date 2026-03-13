import mongoose from "mongoose";

const referralCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["delivery_partner", "restaurant"],
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      default: null, // null = never expires
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup by code and type
referralCodeSchema.index({ code: 1, type: 1 });
referralCodeSchema.index({ status: 1 });

const ReferralCode = mongoose.model("ReferralCode", referralCodeSchema);
export default ReferralCode;
