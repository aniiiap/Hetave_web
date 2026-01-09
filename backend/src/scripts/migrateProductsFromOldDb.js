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

const OLD_MONGO_URI =
  process.env.OLD_MONGO_URI || "mongodb://127.0.0.1:27017/hetave_old";
const NEW_MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hetave";

async function migrateProducts() {
  let oldConn;
  let newConn;

  try {
    console.log("Connecting to OLD MongoDB:", OLD_MONGO_URI);
    oldConn = await mongoose.createConnection(OLD_MONGO_URI).asPromise();
    console.log("Connected to OLD MongoDB.");

    console.log("Connecting to NEW MongoDB:", NEW_MONGO_URI);
    newConn = await mongoose.createConnection(NEW_MONGO_URI).asPromise();
    console.log("Connected to NEW MongoDB.");

    // Reuse the existing Product schema on both connections
    const productSchema = Product.schema;
    const OldProduct = oldConn.model("Product", productSchema);
    const NewProduct = newConn.model("Product", productSchema);

    // Fetch all products from old DB
    const oldProducts = await OldProduct.find({});
    console.log(`Found ${oldProducts.length} products in OLD database.`);

    if (oldProducts.length === 0) {
      console.log("No products to migrate. Exiting.");
      return;
    }

    const baseUploadsDir = path.join(__dirname, "../..", "uploads", "products");

    let createdCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const oldProd of oldProducts) {
      try {
        // Skip if a product with same name already exists in new DB
        const existing = await NewProduct.findOne({ name: oldProd.name });
        if (existing) {
          console.log(
            `Skipping "${oldProd.name}" – already exists in new database.`
          );
          skippedCount++;
          continue;
        }

        let imageUrl = oldProd.image;

        // If image is not already a URL, upload the local file to Cloudinary
        if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
          const localPath = path.join(baseUploadsDir, imageUrl);
          if (fs.existsSync(localPath)) {
            console.log(
              `Uploading image "${imageUrl}" for product "${oldProd.name}" to Cloudinary...`
            );
            const uploadRes = await cloudinary.uploader.upload(localPath, {
              folder: "hetave/products",
            });
            imageUrl = uploadRes.secure_url;
          } else {
            console.warn(
              `Local image not found for "${oldProd.name}" at ${localPath}. Keeping original image value.`
            );
          }
        }

        // Build new product data (copy fields, but use new image URL and let Mongo assign new _id)
        const data = {
          name: oldProd.name,
          description: oldProd.description,
          brand: oldProd.brand,
          price: oldProd.price,
          category: oldProd.category,
          image: imageUrl,
          images: oldProd.images || [],
          inStock: oldProd.inStock,
          variants: oldProd.variants || [],
          sizes: oldProd.sizes || [],
          createdAt: oldProd.createdAt,
          updatedAt: oldProd.updatedAt,
        };

        const created = await NewProduct.create(data);
        console.log(
          `✓ Migrated product "${created.name}" with image: ${created.image}`
        );
        createdCount++;
      } catch (err) {
        console.error(
          `✗ Failed to migrate product "${oldProd.name}" (${oldProd._id}):`,
          err.message
        );
        failedCount++;
      }
    }

    console.log("Product migration completed.");
    console.log(`Created in new DB: ${createdCount}`);
    console.log(`Skipped (already existed): ${skippedCount}`);
    console.log(`Failed: ${failedCount}`);
  } catch (err) {
    console.error("Migration error:", err.message);
  } finally {
    if (oldConn) {
      await oldConn.close();
      console.log("OLD MongoDB disconnected.");
    }
    if (newConn) {
      await newConn.close();
      console.log("NEW MongoDB disconnected.");
    }
    process.exit(0);
  }
}

migrateProducts();


