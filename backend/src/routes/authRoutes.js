import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

// Ensure environment variables are loaded before we read them
dotenv.config();

const router = express.Router();

// Google OAuth configuration (server-side flow)
const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const googleRedirectUri =
  process.env.GOOGLE_REDIRECT_URI ||
  `${process.env.BASE_URL || "http://localhost:5002"}/api/auth/google/callback`;
const clientUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";

const googleClient =
  googleClientId && googleClientSecret
    ? new OAuth2Client(googleClientId, googleClientSecret, googleRedirectUri)
    : null;

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "hetave_secret",
      { expiresIn: "30d" }
    );

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "hetave_secret",
      { expiresIn: "30d" }
    );

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({
      success: true,
      message: "Login successful",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Google OAuth login/signup (server-side redirect flow)
router.get("/google", (req, res) => {
  try {
    if (!googleClient) {
      return res.status(500).json({
        success: false,
        message: "Google login is not configured on the server",
      });
    }

    const state = req.query.state || ""; // optional redirect info

    const authorizeUrl = googleClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
      redirect_uri: googleRedirectUri,
      state,
    });

    return res.redirect(authorizeUrl);
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to start Google login",
    });
  }
});

router.get("/google/callback", async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(500).send("Google login is not configured on the server.");
    }

    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send("Missing authorization code from Google.");
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: googleRedirectUri,
    });

    if (!tokens || !tokens.id_token) {
      return res.status(500).send("Failed to obtain ID token from Google.");
    }

    // Verify ID token and extract profile
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email) {
      return res.status(400).send("Unable to retrieve email from Google account.");
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword =
        Math.random().toString(36).slice(2) + Date.now().toString(36);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: hashedPassword,
        role: "user",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "hetave_secret",
      { expiresIn: "30d" }
    );

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const redirectPath = state || "/products";

    const redirectUrl = `${clientUrl}/google-callback?token=${encodeURIComponent(
      token
    )}&user=${encodeURIComponent(JSON.stringify(userResponse))}&redirect=${encodeURIComponent(
      redirectPath
    )}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google callback error:", error);
    return res
      .status(500)
      .send("An error occurred while processing Google login. Please try again.");
  }
});

export default router;

