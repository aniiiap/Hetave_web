import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    // Razorpay fields - commented out for now, will be enabled later
    // razorpayOrderId: String,
    // razorpayPaymentId: String,
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;


