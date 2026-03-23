import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import Admin model
import Admin from "../modules/admin/models/Admin.js";

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};

const createAdmin = async () => {
  try {
    // Admin details (override with ADMIN_EMAIL / ADMIN_PASSWORD in .env)
    const adminData = {
      name: "TruOrder Admin",
      email: process.env.ADMIN_EMAIL || "truorder@gmail.com",
      phone: process.env.ADMIN_PHONE || "0000000000",
      password: process.env.ADMIN_PASSWORD || "truorder123",
      role: "admin",
      isActive: true,
      phoneVerified: false,
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      email: adminData.email.toLowerCase(),
    });

    if (existingAdmin) {
      console.log(
        `ℹ️ Admin already exists: ${adminData.email} — skipping create.`,
      );
      process.exit(0);
    }

    // Create new admin (password will be hashed by pre-save hook)
    const admin = await Admin.create(adminData);

    const adminResponse = admin.toObject();
    delete adminResponse.password;
    console.log("✅ TruOrder admin created:", adminData.email);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);

    if (error.code === 11000) {
      console.error("Admin with this email already exists");
    }

    process.exit(1);
  }
};

// Run the script
connectDB().then(() => {
  createAdmin();
});
