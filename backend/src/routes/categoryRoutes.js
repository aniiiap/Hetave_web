import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import streamifier from "streamifier";
import Category from "../models/Category.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads (memory storage, then upload to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Helper: upload a buffer to Cloudinary
const uploadBufferToCloudinary = (buffer, folder = "hetave/categories") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.json({
      success: true,
      categories: categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        description: category.description || "",
        image: category.image || null,
        createdAt: category.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    res.json({
      success: true,
      category: {
        id: category._id.toString(),
        name: category.name,
        description: category.description || "",
        image: category.image || null,
        createdAt: category.createdAt,
      },
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Admin
router.post("/", protect, admin, upload.single("image"), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide category name",
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    let imageUrl = null;
    if (req.file) {
      // Upload image to Cloudinary
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
    }

    const category = await Category.create({
      name,
      description: description || "",
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: {
        id: category._id.toString(),
        name: category.name,
        description: category.description || "",
        image: category.image || null,
      },
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Admin
router.put("/:id", protect, admin, upload.single("image"), async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
    }

    const updateData = {
      name: name || category.name,
      description: description !== undefined ? description : category.description,
    };

    // If new image uploaded, upload to Cloudinary and update image field
    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
      updateData.image = uploadResult.secure_url;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Category updated successfully",
      category: {
        id: updatedCategory._id.toString(),
        name: updatedCategory.name,
        description: updatedCategory.description || "",
        image: updatedCategory.image || null,
      },
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;

