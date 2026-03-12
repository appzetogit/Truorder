import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Admin from "../modules/admin/models/Admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGODB_URI is not set in .env");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);

    console.log("Promoting all existing admins to super_admin...");
    const result = await Admin.updateMany(
      {},
      { $set: { role: "super_admin" } }
    );

    console.log("Matched admins:", result.matchedCount ?? result.nMatched);
    console.log("Modified admins:", result.modifiedCount ?? result.nModified);

    await mongoose.disconnect();
    console.log("Done. You can now log out and log back in as any admin; they will be super_admin and see Hub Management.");
    process.exit(0);
  } catch (err) {
    console.error("Error promoting admins to super_admin:", err);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

run();

