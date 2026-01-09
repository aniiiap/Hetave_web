import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import { protect, admin } from "../middleware/authMiddleware.js";

dotenv.config();

const router = express.Router();

// Email transporter configuration (using nodemailer for now)
// Resend will be added later when credentials are available
let transporter = null;

if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL || "sales.hetave@gmail.com",
      pass: process.env.ADMIN_EMAIL_PASSWORD,
    },
  });
}

// Helper function to send email
async function sendEmail({ to, subject, html, from }) {
  const fromEmail = from || process.env.ADMIN_EMAIL || "sales.hetave@gmail.com";

  if (!transporter) {
    console.warn("Email transporter not configured. Email not sent.");
    console.log("Email would be sent to:", to);
    console.log("Subject:", subject);
    return { success: true, message: "Email service not configured" };
  }

  try {
    return await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}

// Regular order endpoint
router.post("/", async (req, res) => {
  try {
    const orderData = req.body;
    
    // Find or get user by email (if logged in, use userId from token)
    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const jwt = await import("jsonwebtoken");
        const User = (await import("../models/User.js")).default;
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || "hetave_secret");
        userId = decoded.id;
      } catch (err) {
        // User not logged in, continue as guest
      }
    }
    
    // If user not found but email provided, try to find user by email
    if (!userId && orderData.email) {
      const User = (await import("../models/User.js")).default;
      const user = await User.findOne({ email: orderData.email.toLowerCase() });
      if (user) {
        userId = user._id;
      }
    }

    // Map cart items to order items format
    const orderItems = orderData.items.map((item) => ({
      product: item.id || null, // Product ID from cart
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    }));

    // Create order in database
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress: {
        fullName: orderData.name,
        address: orderData.address,
        city: orderData.city,
        state: orderData.state,
        postalCode: orderData.pincode,
        country: orderData.country || "India",
        phone: orderData.phone,
      },
      totalAmount: orderData.total,
      paymentStatus: "pending", // Will be updated to "paid" after successful payment gateway confirmation
      status: "pending",
    });

    // Send confirmation email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">Thank you for your order!</h2>
        <p>Your order has been received and is being processed.</p>
        <p><strong>Order Number: ORD-${order._id.toString().slice(-8).toUpperCase()}</strong></p>
        <h3>Order Details:</h3>
        <ul>
          ${orderData.items.map(item => `
            <li><strong>${item.name}</strong> - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toLocaleString()}</li>
          `).join('')}
        </ul>
        <p><strong>Total: ₹${orderData.total.toLocaleString()}</strong></p>
        <p>We will contact you shortly regarding shipping details.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Best regards,<br>Hetave Enterprises Team</p>
      </div>
    `;

    await sendEmail({
      to: orderData.email,
      subject: "Order Confirmation - Hetave Enterprises",
      html: emailHtml,
    });
    
    res.json({ 
      success: true, 
      message: "Order placed successfully",
      order: {
        id: order._id,
        orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
      }
    });
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error processing order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Bulk order endpoint (for orders with quantity >= 10)
router.post("/bulk", async (req, res) => {
  try {
    const orderData = req.body;
    
    // Send email to admin about bulk order
    const adminEmail = process.env.ADMIN_EMAIL || "sales.hetave@gmail.com";
    
    const bulkItems = orderData.items.filter(item => item.quantity >= 10);
    
    // Admin email HTML
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">New Bulk Order Request</h2>
        <p>A customer has requested a bulk order. Please contact them directly.</p>
        
        <h3>Customer Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${orderData.name}</li>
          <li><strong>Email:</strong> ${orderData.email}</li>
          <li><strong>Phone:</strong> ${orderData.phone}</li>
          <li><strong>Address:</strong> ${orderData.address}</li>
          <li><strong>City:</strong> ${orderData.city}</li>
          <li><strong>State:</strong> ${orderData.state}</li>
          <li><strong>Pincode:</strong> ${orderData.pincode}</li>
        </ul>
        
        <h3>Order Details:</h3>
        <ul>
          ${orderData.items.map(item => `
            <li>
              <strong>${item.name}</strong><br>
              Quantity: ${item.quantity} ${item.quantity >= 10 ? '<span style="color: red; font-weight: bold;">(BULK ORDER)</span>' : ''}<br>
              Price per unit: ₹${item.price.toLocaleString()}<br>
              Subtotal: ₹${(item.price * item.quantity).toLocaleString()}
            </li>
          `).join('')}
        </ul>
        
        <p><strong>Total Order Value: ₹${orderData.total.toLocaleString()}</strong></p>
        
        <p>Please contact the customer at <a href="mailto:${orderData.email}">${orderData.email}</a> or ${orderData.phone} to discuss pricing and delivery.</p>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `Bulk Order Request - ${orderData.name}`,
      html: adminEmailHtml,
    });
    
    // Also send confirmation to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">Thank you for your bulk order request!</h2>
        <p>We have received your request for bulk quantities. Our sales team will contact you shortly to discuss:</p>
        <ul>
          <li>Best pricing for bulk orders</li>
          <li>Delivery timeline</li>
          <li>Payment terms</li>
        </ul>
        <h3>Your Order Summary:</h3>
        <ul>
          ${orderData.items.map(item => `
            <li><strong>${item.name}</strong> - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toLocaleString()}</li>
          `).join('')}
        </ul>
        <p><strong>Estimated Total: ₹${orderData.total.toLocaleString()}</strong></p>
        <p>We look forward to serving you!</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Best regards,<br>Hetave Enterprises Team</p>
      </div>
    `;

    await sendEmail({
      to: orderData.email,
      subject: "Bulk Order Request Received - Hetave Enterprises",
      html: customerEmailHtml,
    });
    
    res.json({ 
      success: true, 
      message: "Bulk order request submitted successfully. Our team will contact you shortly." 
    });
  } catch (error) {
    console.error("Bulk order error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error processing bulk order request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// @route   GET /api/orders/stats
// @desc    Get order statistics for admin dashboard
// @access  Admin
router.get("/stats", protect, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    
    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
      },
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (admin only)
// @access  Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.product", "name image category")
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders: orders.map((order) => ({
        id: order._id,
        orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
        user: order.user
          ? {
              id: order.user._id,
              name: order.user.name,
              email: order.user.email,
            }
          : null,
        items: order.items.map((item) => ({
          product: item.product
            ? {
                id: item.product._id,
                name: item.product.name,
                image: item.product.image,
                category: item.product.category,
              }
            : null,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        shippingAddress: order.shippingAddress,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        status: order.status,
        // Razorpay fields - commented out for now, will be enabled later
        // razorpayOrderId: order.razorpayOrderId,
        // razorpayPaymentId: order.razorpayPaymentId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details
// @access  Admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name image category price");
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    
    res.json({
      success: true,
      order: {
        id: order._id,
        orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
        user: order.user
          ? {
              id: order.user._id,
              name: order.user.name,
              email: order.user.email,
            }
          : null,
        items: order.items.map((item) => ({
          product: item.product
            ? {
                id: item.product._id,
                name: item.product.name,
                image: item.product.image,
                category: item.product.category,
                price: item.product.price,
              }
            : null,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        shippingAddress: order.shippingAddress,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        status: order.status,
        // Razorpay fields - commented out for now, will be enabled later
        // razorpayOrderId: order.razorpayOrderId,
        // razorpayPaymentId: order.razorpayPaymentId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Admin
router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !["pending", "processing", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, processing, shipped, delivered",
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("user", "name email")
      .populate("items.product", "name image category");
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    
    res.json({
      success: true,
      message: "Order status updated successfully",
      order: {
        id: order._id,
        orderNumber: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
