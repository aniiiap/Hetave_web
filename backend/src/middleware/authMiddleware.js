import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    // Check if it's an admin token (for hardcoded admin login)
    if (token.startsWith("admin_token_")) {
      req.user = {
        id: "admin",
        email: "admin@hetave.com",
        name: "Admin",
        role: "admin",
      };
      return next();
    }
    
    // Regular JWT token verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "hetave_secret");
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};


