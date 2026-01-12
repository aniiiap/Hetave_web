import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();
  const navigate = useNavigate();

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder-image.jpg";
    // If already a full URL (Cloudinary, etc.), return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    if (imagePath.startsWith("/uploads")) return `${API_URL}${imagePath}`;
    if (imagePath.startsWith("/products")) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <svg
              className="mx-auto h-24 w-24 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              Your cart is empty
            </h2>
            <p className="mt-2 text-slate-600">
              Start adding products to your cart to continue shopping.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">Shopping Cart</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-xl border-2 border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="h-24 w-24 rounded-lg object-contain sm:h-32 sm:w-32"
                      onError={(e) => {
                        // Fallback to local image if API image fails
                        const imageName = item.image?.split("/").pop();
                        e.target.src = imageName ? `/products/${imageName}` : "/placeholder-image.jpg";
                      }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-slate-500">{item.category}</p>
                      </div>
                      <button
                        onClick={() => {
                          removeFromCart(item.id);
                          toast.success(`${item.name} removed from cart`);
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">
                          Quantity:
                        </span>
                        <div className="flex items-center gap-2 rounded-lg border border-slate-300">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-500">
                          ₹{item.price.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-xl border-2 border-slate-200 bg-slate-50 p-6">
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Order Summary
              </h2>
              <div className="space-y-3 border-b border-slate-300 pb-4">
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
              <button
                onClick={handleCheckout}
                className="mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700 hover:shadow-xl"
              >
                Proceed to Checkout
              </button>
              <Link
                to="/products"
                className="mt-3 block w-full text-center text-sm font-medium text-slate-600 underline-offset-2 hover:text-orange-600 hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;

