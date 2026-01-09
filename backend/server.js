import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";

// NOTE: Route modules will be added gradually; comment out unused imports to avoid startup errors.
import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js";
// import insuranceRoutes from "./src/routes/insuranceRoutes.js";
// import enquiryRoutes from "./src/routes/enquiryRoutes.js";
// import paymentRoutes from "./src/routes/paymentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hetave";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration - allow only known frontends in production
const allowedOrigins = [FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"].filter(
  Boolean
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients or same-origin requests with no Origin header
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (NODE_ENV === "development") {
        // In dev, log but don't block unexpected origins
        console.warn(`CORS: Allowing unexpected origin in dev: ${origin}`);
        return callback(null, true);
      }
      console.warn(`CORS: Blocked origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic rate limiting to protect the API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
});

const authAndContactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // stricter on auth + contact to reduce abuse
});

app.use("/api", apiLimiter);
app.use("/api/auth", authAndContactLimiter);
app.use("/api/contacts", authAndContactLimiter);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

app.get("/", (req, res) => {
  res.json({ message: "Hetave API running" });
});

// API route mounting will be enabled as individual route files are implemented.
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contacts", contactRoutes);
// app.use("/api/insurance", insuranceRoutes);
// app.use("/api/enquiries", enquiryRoutes);
// app.use("/api/payments", paymentRoutes);

// Global error handler (fallback)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${NODE_ENV} mode`);
});

