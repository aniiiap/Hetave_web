import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import toast from "react-hot-toast";

function CheckoutPage() {
  const { cart, getCartTotal, hasBulkOrder, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "upi",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderData = {
        ...formData,
        items: cart,
        total: getCartTotal(),
        isBulkOrder: hasBulkOrder(),
      };

      // If bulk order (>=10 items), send email to admin
      if (hasBulkOrder()) {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5002";
        const response = await fetch(`${apiUrl}/api/orders/bulk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          toast.success(
            "Thank you! Your bulk order request has been sent. Our team will contact you shortly."
          );
          clearCart();
          navigate("/");
        } else {
          throw new Error("Failed to submit order");
        }
      } else {
        // Regular order - process normally
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5002";
        const response = await fetch(`${apiUrl}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          toast.success("Order placed successfully! Thank you for your purchase.");
          clearCart();
          navigate("/");
        } else {
          throw new Error("Failed to place order");
        }
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("There was an error processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Your cart is empty
          </h2>
          <p className="mt-2 text-slate-600">
            Add items to your cart before checkout.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mt-6 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">Checkout</h1>

        {hasBulkOrder() && (
          <div className="mb-6 rounded-lg border-2 border-orange-500 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="h-6 w-6 flex-shrink-0 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-orange-900">
                  Bulk Order Detected
                </h3>
                <p className="mt-1 text-sm text-orange-800">
                  You have items with quantity 10 or more. Our team will contact
                  you directly to process this order and provide you with the
                  best pricing.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  Shipping Information
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border-2 border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {/* UPI */}
                  <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition ${
                    formData.paymentMethod === "upi"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === "upi"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-500"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-slate-900">
                          UPI
                        </span>
                        <p className="text-sm text-slate-600">
                          Pay using UPI (Google Pay, PhonePe, Paytm, etc.)
                        </p>
                      </div>
                      {formData.paymentMethod === "upi" && (
                        <svg className="h-5 w-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </label>

                  {/* Credit/Debit Card */}
                  <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition ${
                    formData.paymentMethod === "card"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === "card"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-500"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-slate-900">
                          Credit/Debit Card
                        </span>
                        <p className="text-sm text-slate-600">
                          Pay using Visa, Mastercard, RuPay, or other cards
                        </p>
                      </div>
                      {formData.paymentMethod === "card" && (
                        <svg className="h-5 w-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </label>

                  {/* Net Banking */}
                  <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition ${
                    formData.paymentMethod === "netbanking"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={formData.paymentMethod === "netbanking"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-500"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-slate-900">
                          Net Banking
                        </span>
                        <p className="text-sm text-slate-600">
                          Pay directly from your bank account
                        </p>
                      </div>
                      {formData.paymentMethod === "netbanking" && (
                        <svg className="h-5 w-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </label>

                  {/* Wallets */}
                  <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition ${
                    formData.paymentMethod === "wallet"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-orange-300 hover:bg-orange-50"
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      checked={formData.paymentMethod === "wallet"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-500"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-slate-900">
                          Wallets
                        </span>
                        <p className="text-sm text-slate-600">
                          Pay using Paytm, PhonePe, Amazon Pay, or other wallets
                        </p>
                      </div>
                      {formData.paymentMethod === "wallet" && (
                        <svg className="h-5 w-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </label>
                </div>
                <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Secure Payment:</strong> All payments are processed securely through our payment gateway. Your card details are never stored on our servers.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700 hover:shadow-xl disabled:opacity-50"
              >
                {isSubmitting
                  ? "Processing Payment..."
                  : hasBulkOrder()
                    ? "Submit Bulk Order Request"
                    : "Proceed to Payment"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-xl border-2 border-slate-200 bg-slate-50 p-6">
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Order Summary
              </h2>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-slate-200 pb-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-slate-300 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t border-slate-300 pt-4">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-xl font-bold text-orange-600">
                  ₹{getCartTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

