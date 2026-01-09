import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hetave";

// Products with their original image filenames
const initialProducts = [
  {
    name: "Safety Helmet",
    image: "helmet.png",
    category: "Head Protection",
    price: 850,
    description: "High-quality safety helmet designed for maximum protection in industrial and construction environments. Features impact-resistant shell and comfortable padding.",
    brand: "Hetave Safety",
    variants: [],
    inStock: true,
  },
  {
    name: "Safety Shoes",
    image: "shoes.png",
    category: "Foot Protection",
    price: 1200,
    description: "Durable safety shoes with steel toe cap and slip-resistant sole. Perfect for industrial workplaces requiring foot protection.",
    brand: "Hetave Safety",
    variants: [],
    inStock: true,
  },
  {
    name: "Safety Uniform",
    image: "uniform.png",
    category: "Body Protection",
    price: 650,
    description: "High-visibility safety uniform designed for maximum visibility and protection in low-light conditions.",
    brand: "Hetave Safety",
    variants: [],
    inStock: true,
  },
  {
    name: "Fire Extinguisher",
    image: "Extinguisher.png",
    category: "Fire Safety",
    price: 2500,
    description: "Portable fire extinguisher suitable for Class A, B, and C fires. Essential safety equipment for all workplaces.",
    brand: "Hetave Safety",
    variants: [],
    inStock: true,
  },
  {
    name: "Safety Gloves",
    image: "Gloves.png",
    category: "Hand Protection",
    price: 350,
    description: "Cut-resistant safety gloves providing excellent dexterity and protection against cuts, abrasions, and punctures.",
    brand: "Hetave Safety",
    variants: [],
    inStock: true,
  },
  {
    name: "Safety Goggles",
    image: "goggle.png",
    category: "Eye Protection",
    price: 450,
    description: "Anti-fog safety goggles with UV protection. Comfortable fit with adjustable strap for all-day wear.",
    brand: "Hetave Safety",
    variants: [],
    inStock: true,
  },
  {
    name: "Ear Protection",
    image: "earprod.png",
    category: "Hearing Protection",
    price: 550,
    description: "Comfortable ear protection earmuffs with excellent noise reduction rating. Ideal for high-noise environments.",
    brand: "Hetave Safety",
    variants: [],
    inStock: true,
  },
  {
    name: "Safety Ladder",
    image: "ladder.png",
    category: "Safety Ladder",
    price: 3500,
    description: "Heavy-duty safety ladder with non-slip rungs and stabilizer bars. Certified for industrial use.",
    brand: "Hetave Safety",
    variants: [],
    inStock: true,
  },
  {
    name: "Safety Tape",
    image: "tape.png",
    category: "Safety Tape",
    price: 150,
    description: "High-visibility safety tape for marking hazards and restricted areas. Weather-resistant and long-lasting.",
    brand: "Hetave Safety",
    variants: [],
    inStock: true,
  },
];

async function copyImages() {
  const frontendProductsDir = path.join(__dirname, "../../../frontend/public/products");
  const backendProductsDir = path.join(__dirname, "../../uploads/products");

  // Create backend uploads/products directory if it doesn't exist
  if (!fs.existsSync(backendProductsDir)) {
    fs.mkdirSync(backendProductsDir, { recursive: true });
  }

  // Copy each product image
  for (const product of initialProducts) {
    const sourcePath = path.join(frontendProductsDir, product.image);
    const destPath = path.join(backendProductsDir, product.image);

    if (fs.existsSync(sourcePath)) {
      try {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✓ Copied ${product.image}`);
      } catch (error) {
        console.error(`✗ Failed to copy ${product.image}:`, error.message);
      }
    } else {
      console.warn(`⚠ Image not found: ${product.image} - skipping copy`);
    }
  }
}

async function seedProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✓ MongoDB connected");

    // Copy images first
    console.log("\nCopying product images...");
    await copyImages();

    // Check if products already exist
    const existingProducts = await Product.find();
    if (existingProducts.length > 0) {
      console.log(`\n⚠ Found ${existingProducts.length} existing products in database.`);
      console.log("Options:");
      console.log("1. Delete existing products and seed new ones");
      console.log("2. Skip seeding (keep existing products)");
      console.log("\nTo delete and reseed, run: node -e \"require('./src/scripts/seedProducts.js')\"");
      console.log("Or manually delete products from database and run this script again.");
      process.exit(0);
    }

    // Insert products
    console.log("\nSeeding products...");
    const products = await Product.insertMany(initialProducts);
    console.log(`✓ Successfully seeded ${products.length} products:`);
    
    products.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ₹${product.price} (${product.category})`);
    });

    console.log("\n✓ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
