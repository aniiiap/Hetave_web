import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/Category.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hetave";

const DEFAULT_CATEGORIES = [
  {
    name: "Head Protection",
    description: "Protect your head with certified safety helmets and hard hats",
  },
  {
    name: "Eye Protection",
    description: "Safety goggles and glasses for eye protection",
  },
  {
    name: "Safety Mask",
    description: "Respiratory protection masks and face coverings",
  },
  {
    name: "Hearing Protection",
    description: "Ear muffs and earplugs for noise reduction",
  },
  {
    name: "Hand Protection",
    description: "Safety gloves for various industrial applications",
  },
  {
    name: "Foot Protection",
    description: "Safety shoes and boots with steel toe protection",
  },
  {
    name: "Body Protection",
    description: "Safety uniforms and protective clothing",
  },
  {
    name: "Fire Safety",
    description: "Fire extinguishers and fire safety equipment",
  },
  {
    name: "Safety Ladder",
    description: "Industrial safety ladders and access equipment",
  },
  {
    name: "Safety Tape",
    description: "High-visibility safety tapes and marking solutions",
  },
];

async function seedCategories() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected.");

    let createdCount = 0;
    let skippedCount = 0;

    for (const categoryData of DEFAULT_CATEGORIES) {
      try {
        // Check if category already exists
        const existing = await Category.findOne({ name: categoryData.name });
        if (existing) {
          console.log(`Category "${categoryData.name}" already exists. Skipping.`);
          skippedCount++;
          continue;
        }

        // Create new category
        const category = await Category.create({
          name: categoryData.name,
          description: categoryData.description,
          image: null, // No image initially, can be added later from admin
        });

        console.log(`✓ Created category: "${category.name}"`);
        createdCount++;
      } catch (err) {
        console.error(`✗ Error creating category "${categoryData.name}":`, err.message);
      }
    }

    console.log("\nCategory seeding completed.");
    console.log(`Created: ${createdCount}`);
    console.log(`Skipped (already existed): ${skippedCount}`);
  } catch (err) {
    console.error("Seeding error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
    process.exit(0);
  }
}

seedCategories();

