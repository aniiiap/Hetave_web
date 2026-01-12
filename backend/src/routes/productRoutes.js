import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import streamifier from "streamifier";
import Product from "../models/Product.js";
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

// For handling multiple color images
const uploadMultiple = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB limit, max 10 files
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
const uploadBufferToCloudinary = (buffer, folder = "hetave/products") => {
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

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get("/", async (req, res) => {
  try {
    // Support category filter via query parameter for better performance
    const category = req.query.category;
    const query = category ? { category } : {};
    
    // Select only needed fields for list view (exclude description for faster loading)
    // Include description if explicitly requested (for detail views)
    const selectFields = req.query.includeDescription === "true" 
      ? "name description brand price category image images colors inStock variants sizes createdAt"
      : "name brand price category image colors inStock variants sizes createdAt";
    
    const products = await Product.find(query)
      .select(selectFields)
      .lean();
    
    // Map products with safe handling for all fields
    const mappedProducts = products.map((product) => {
      try {
        return {
          id: product._id ? product._id.toString() : null,
          name: product.name || "",
          description: "", // Excluded for list view performance
          brand: product.brand || "",
          price: product.price || 0,
          category: product.category || "",
          image: product.image || "",
          images: [], // Excluded for list view
          colors: Array.isArray(product.colors) ? product.colors : [],
          inStock: product.inStock !== undefined ? product.inStock : true,
          variants: Array.isArray(product.variants) ? product.variants : [],
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          createdAt: product.createdAt || new Date(),
        };
      } catch (mapError) {
        console.error(`Error mapping product ${product._id}:`, mapError);
        return null;
      }
    }).filter(p => p !== null); // Remove any null entries
    
    // Add caching headers for better performance
    res.set({
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'ETag': `"${Date.now()}"`
    });
    
    res.json({
      success: true,
      products: mappedProducts,
    });
  } catch (error) {
    console.error("Get products error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    
    // Add caching headers
    res.set({
      'Cache-Control': 'public, max-age=300',
      'ETag': `"${product._id}-${product.updatedAt || Date.now()}"`
    });
    
    res.json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        brand: product.brand,
        price: product.price,
        category: product.category,
        image: product.image,
        images: product.images || [],
        colors: product.colors || [],
        inStock: product.inStock,
        variants: product.variants || [],
        sizes: product.sizes || [],
      },
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Admin
router.post("/", protect, admin, uploadMultiple.fields([
  { name: "image", maxCount: 1 },
  { name: "colorImages", maxCount: 10 }
]), async (req, res) => {
  try {
    const { name, description, brand, price, category, variants, sizes, inStock, colors } =
      req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, price, and category",
      });
    }

    if (!req.files || !req.files.image || req.files.image.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload a product image",
      });
    }

    // Upload main image to Cloudinary
    const uploadResult = await uploadBufferToCloudinary(req.files.image[0].buffer);
    let mainImageUrl = uploadResult.secure_url;

    // Process color images if provided
    let colorVariants = [];
    if (colors) {
      try {
        const colorsData = JSON.parse(colors);
        const colorImages = req.files.colorImages || [];
        
        // Match color images with color names
        for (let i = 0; i < colorsData.length; i++) {
          const colorData = colorsData[i];
          if (colorImages[i]) {
            // Upload color image to Cloudinary
            const colorUploadResult = await uploadBufferToCloudinary(colorImages[i].buffer);
            colorVariants.push({
              name: colorData.name,
              image: colorUploadResult.secure_url,
            });
            // Use first color image as main image if not set
            if (i === 0 && !mainImageUrl) {
              mainImageUrl = colorUploadResult.secure_url;
            }
          } else if (colorData.image) {
            // If image URL is already provided (for editing), use it
            colorVariants.push({
              name: colorData.name,
              image: colorData.image,
            });
          }
        }
      } catch (parseError) {
        console.error("Error parsing colors:", parseError);
      }
    }

    const product = await Product.create({
      name,
      description,
      brand,
      price: parseFloat(price),
      category,
      image: mainImageUrl, // full Cloudinary URL
      images: [],
      colors: colorVariants,
      variants: variants ? JSON.parse(variants) : [],
      sizes: sizes ? JSON.parse(sizes) : [],
      inStock: inStock === "true" || inStock === true,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: {
        id: product._id,
        name: product.name,
        description: product.description,
        brand: product.brand,
        price: product.price,
        category: product.category,
        image: product.image,
        images: product.images,
        colors: product.colors,
        inStock: product.inStock,
        variants: product.variants,
        sizes: product.sizes,
      },
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Admin
router.put(
  "/:id",
  protect,
  admin,
  uploadMultiple.fields([
    { name: "image", maxCount: 1 },
    { name: "colorImages", maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const { name, description, brand, price, category, variants, sizes, inStock, colors } =
        req.body;

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const updateData = {
        name: name || product.name,
        description: description !== undefined ? description : product.description,
        brand: brand !== undefined ? brand : product.brand,
        price: price ? parseFloat(price) : product.price,
        category: category || product.category,
        variants: variants ? JSON.parse(variants) : product.variants,
        sizes: sizes ? JSON.parse(sizes) : product.sizes,
        inStock:
          inStock !== undefined
            ? inStock === "true" || inStock === true
            : product.inStock,
      };

      // If new main image uploaded, upload to Cloudinary and update image field
      if (req.files && req.files.image && req.files.image.length > 0) {
        const uploadResult = await uploadBufferToCloudinary(req.files.image[0].buffer);
        updateData.image = uploadResult.secure_url;
      }

      // Process color images if provided
      if (colors) {
        try {
          const colorsData = JSON.parse(colors);
          const colorImages = req.files && req.files.colorImages ? req.files.colorImages : [];
          
          let colorVariants = [];
          let colorImageIndex = 0;
          
          // Match color images with color names
          for (let i = 0; i < colorsData.length; i++) {
            const colorData = colorsData[i];
            if (colorImages[colorImageIndex]) {
              // Upload new color image to Cloudinary
              const colorUploadResult = await uploadBufferToCloudinary(colorImages[colorImageIndex].buffer);
              colorVariants.push({
                name: colorData.name,
                image: colorUploadResult.secure_url,
              });
              colorImageIndex++;
            } else if (colorData.image) {
              // If image URL is already provided (existing color), use it
              colorVariants.push({
                name: colorData.name,
                image: colorData.image,
              });
            }
          }
          
          updateData.colors = colorVariants;
          // Update main image to first color if colors exist and no main image was uploaded
          if (colorVariants.length > 0 && !updateData.image && colorVariants[0].image) {
            updateData.image = colorVariants[0].image;
          }
        } catch (parseError) {
          console.error("Error parsing colors:", parseError);
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: "Product updated successfully",
        product: {
          id: updatedProduct._id.toString(),
          name: updatedProduct.name,
          description: updatedProduct.description,
          brand: updatedProduct.brand,
          price: updatedProduct.price,
          category: updatedProduct.category,
          image: updatedProduct.image,
          images: updatedProduct.images || [],
          colors: updatedProduct.colors || [],
          inStock: updatedProduct.inStock,
          variants: updatedProduct.variants || [],
          sizes: updatedProduct.sizes || [],
          createdAt: updatedProduct.createdAt,
        },
      });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating product",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;

