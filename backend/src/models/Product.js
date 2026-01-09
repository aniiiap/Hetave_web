import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    brand: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true }, // Changed to string to match frontend
    image: { type: String, required: true }, // Main product image (default/first color)
    images: [{ type: String }], // Additional images
    colors: [
      {
        name: { type: String, required: true }, // Color name (e.g., "Red", "Blue", "Black")
        image: { type: String, required: true }, // Color-specific image URL
      },
    ], // Color variants with images
    inStock: { type: Boolean, default: true },
    variants: [{ type: String }], // Product variants
    sizes: [{ type: String }], // Product sizes
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;


