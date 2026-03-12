import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import DiningCategory from "../modules/dining/models/DiningCategory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const categoriesToSeed = [
  {
    name: "Cozy cafes",
    imageUrl: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=600&fit=crop",
    cloudinaryPublicId: "seed-dining-cozy-cafes",
  },
  {
    name: "Pure veg",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    cloudinaryPublicId: "seed-dining-pure-veg",
  },
  {
    name: "Family dining",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=600&fit=crop",
    cloudinaryPublicId: "seed-dining-family-dining",
  },
  {
    name: "Drink & dine",
    imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop",
    cloudinaryPublicId: "seed-dining-drink-and-dine",
  },
  {
    name: "Buffet",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
    cloudinaryPublicId: "seed-dining-buffet",
  },
  {
    name: "Premium dining",
    imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop",
    cloudinaryPublicId: "seed-dining-premium-dining",
  },
];

async function main() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGODB_URI not set in Backend/.env");
      process.exit(1);
    }

    await mongoose.connect(uri);

    for (const cat of categoriesToSeed) {
      const existing = await DiningCategory.findOne({ name: cat.name });
      if (existing) {
        continue;
      }
      await DiningCategory.create(cat);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error seeding dining categories:", err);
    process.exit(1);
  }
}

main();

