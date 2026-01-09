import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hetave";

async function migrateImages() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected.");

    // Find products whose image field is a local filename (not a full URL)
    const products = await Product.find({
      image: { $exists: true, $ne: null, $not: /^https?:\/\//i },
    });

    console.log(`Found ${products.length} products with local images to migrate.`);

    const baseUploadsDir = path.join(__dirname, "../..", "uploads", "products");

    let successCount = 0;
    let failCount = 0;

    for (const product of products) {
      try {
        const filename = product.image;
        const localPath = path.join(baseUploadsDir, filename);

        if (!fs.existsSync(localPath)) {
          console.warn(
            `File not found for product "${product.name}" (${product._id}): ${localPath}`
          );
          failCount++;
          continue;
        }

        console.log(`Uploading "${filename}" for product "${product.name}"...`);

        const uploadResult = await cloudinary.uploader.upload(localPath, {
          folder: "hetave/products",
        });

        product.image = uploadResult.secure_url;
        await product.save();

        console.log(
          `✓ Migrated image for "${product.name}" -> ${uploadResult.secure_url}`
        );
        successCount++;
      } catch (err) {
        console.error(
          `✗ Failed to migrate image for product "${product.name}" (${product._id}):`,
          err.message
        );
        failCount++;
      }
    }

    console.log("Migration completed.");
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Failed: ${failCount}`);
  } catch (err) {
    console.error("Migration error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
    process.exit(0);
  }
}

migrateImages();


