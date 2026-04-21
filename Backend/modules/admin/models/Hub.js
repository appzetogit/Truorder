import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const hubSchema = new mongoose.Schema(
  {
    hubName: {
      type: String,
      required: true,
      trim: true,
    },
    managerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

hubSchema.index({ status: 1 });
hubSchema.index({ createdBy: 1 });

hubSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

hubSchema.methods.comparePassword = async function comparePassword(
  candidatePassword,
) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const Hub = mongoose.model("Hub", hubSchema);

export default Hub;
