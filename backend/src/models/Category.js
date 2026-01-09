import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String }, // Category image URL (Cloudinary)
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;


