import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hetave";

async function updateProductCategories() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✓ MongoDB connected");

    // Update Safety Ladder category
    const ladderResult = await Product.updateMany(
      { name: "Safety Ladder" },
      { $set: { category: "Safety Ladder" } }
    );
    console.log(`✓ Updated ${ladderResult.modifiedCount} Safety Ladder product(s)`);

    // Update Safety Tape category
    const tapeResult = await Product.updateMany(
      { name: "Safety Tape" },
      { $set: { category: "Safety Tape" } }
    );
    console.log(`✓ Updated ${tapeResult.modifiedCount} Safety Tape product(s)`);

    // Verify the updates
    const ladder = await Product.findOne({ name: "Safety Ladder" });
    const tape = await Product.findOne({ name: "Safety Tape" });

    if (ladder) {
      console.log(`\n✓ Safety Ladder category: ${ladder.category}`);
    } else {
      console.log("\n⚠ Safety Ladder product not found");
    }

    if (tape) {
      console.log(`✓ Safety Tape category: ${tape.category}`);
    } else {
      console.log("⚠ Safety Tape product not found");
    }

    console.log("\n✓ Category update completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error updating product categories:", error);
    process.exit(1);
  }
}

updateProductCategories();

