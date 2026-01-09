import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hetave";

async function revertUniformProduct() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✓ MongoDB connected");

    // Revert Industrial Uniform back to Safety Uniform without variants
    const result = await Product.updateMany(
      { name: "Industrial Uniform" },
      { 
        $set: { 
          name: "Safety Uniform",
          description: "High-visibility safety uniform designed for maximum visibility and protection in low-light conditions.",
          variants: []
        } 
      }
    );
    console.log(`✓ Reverted ${result.modifiedCount} product(s)`);

    // Verify the revert
    const uniform = await Product.findOne({ name: "Safety Uniform" });

    if (uniform) {
      console.log(`\n✓ Product name: ${uniform.name}`);
      console.log(`✓ Variants: ${uniform.variants.length} (should be 0)`);
    } else {
      console.log("\n⚠ Safety Uniform product not found");
    }

    console.log("\n✓ Product revert completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error reverting product:", error);
    process.exit(1);
  }
}

revertUniformProduct();

