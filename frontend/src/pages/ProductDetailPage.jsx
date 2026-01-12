import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products/${id}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.product);
      } else {
        console.error("Error fetching product:", data.message);
        toast.error("Failed to load product details");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    setSelectedColorIndex(0); // Reset to first color when product changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch related products when product is loaded
  useEffect(() => {
    if (product && product.category) {
      fetchRelatedProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const fetchRelatedProducts = async () => {
    if (!product || !product.category) return;
    
    try {
      setLoadingRelated(true);
      // Fetch only products from the same category (more efficient)
      const response = await fetch(`${API_URL}/api/products?category=${encodeURIComponent(product.category)}`);
      const data = await response.json();
      if (data.success) {
        // Filter out current product and limit to 4
        const related = data.products
          .filter((p) => p.id !== product.id)
          .slice(0, 4); // Show max 4 related products
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setLoadingRelated(false);
    }
  };

  // Helper: get display image (first color image if available, otherwise main image)
  const getProductDisplayImage = (prod) => {
    if (prod.colors && prod.colors.length > 0 && prod.colors[0].image) {
      return prod.colors[0].image;
    }
    return prod.image || "";
  };

  // Get current displayed image based on selected color
  const getCurrentImage = () => {
    if (product && product.colors && product.colors.length > 0) {
      return product.colors[selectedColorIndex]?.image || product.image;
    }
    return product?.image || "";
  };

  const handleColorSelect = (index) => {
    setSelectedColorIndex(index);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
            <p className="mt-4 text-slate-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-semibold text-slate-900">Product not found</p>
            <Link
              to="/products"
              className="mt-4 inline-block text-orange-600 hover:text-orange-700"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="text-slate-600 hover:text-orange-500 transition"
            >
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <Link
              to="/products"
              className="text-slate-600 hover:text-orange-500 transition"
            >
              Products
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: Product Images */}
          <div>
            <div className="sticky top-28">
              <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                <div className="aspect-square p-8">
                  <img
                    src={getCurrentImage()}
                    alt={product.name}
                    className="h-full w-full object-contain"
                    loading="eager"
                    decoding="async"
                    onError={(e) => {
                      // Fallback to local image if remote image fails
                      const imageName = getCurrentImage().split("/").pop();
                      e.target.src = `/products/${imageName}`;
                    }}
                  />
                </div>
              </div>
              
              {/* Color Variants Thumbnails */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Available Colors
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorSelect(index)}
                        className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                          selectedColorIndex === index
                            ? "border-orange-500 ring-2 ring-orange-200"
                            : "border-slate-300 hover:border-orange-400"
                        }`}
                      >
                        <div className="aspect-square w-20 overflow-hidden bg-slate-100">
                          <img
                            src={color.image}
                            alt={color.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.target.src = "/placeholder-image.png";
                            }}
                          />
                        </div>
                        <div
                          className={`absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1 text-center text-xs font-medium text-white transition ${
                            selectedColorIndex === index
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {color.name}
                        </div>
                        {selectedColorIndex === index && (
                          <div className="absolute top-1 right-1">
                            <div className="h-4 w-4 rounded-full bg-orange-500 ring-2 ring-white"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Selected: <span className="font-semibold text-slate-900">{product.colors[selectedColorIndex]?.name}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div>
            <div className="mb-4">
              <span className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600">
                {product.category}
              </span>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-slate-900 sm:text-5xl">
              {product.name}
            </h1>
            {product.description && (
              <p className="mb-6 text-lg leading-relaxed text-slate-600">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-orange-600">
                ₹{product.price.toLocaleString()}
              </span>
            </div>

            {/* Stock Status */}
            {!product.inStock && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-2">
                <p className="text-sm font-medium text-red-800">Out of Stock</p>
              </div>
            )}

            {/* Specifications */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Specifications
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-red-600"
                    >
                      {variant}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Call Now & Inquiry Now Buttons */}
            <div className="mb-8 flex flex-wrap gap-3">
              <a
                href="tel:+918095289835"
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700 hover:shadow-xl"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Call Now
              </a>
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-orange-500 bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                Inquiry Now
              </Link>
            </div>

            {/* Additional Info */}
            {product.brand && (
              <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  Product Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-slate-600">Brand: </span>
                    <span className="text-sm text-slate-900">{product.brand}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Category: </span>
                    <span className="text-sm text-slate-900">{product.category}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Status: </span>
                    <span className="text-sm text-slate-900">
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-slate-200 pt-12">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold text-slate-900">
                Related Products
              </h2>
              <p className="text-slate-600">
                More products from {product.category}
              </p>
            </div>

            {loadingRelated ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                  <p className="mt-4 text-slate-600">Loading related products...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/products/${relatedProduct.id}`}
                    className="group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-orange-400 hover:shadow-xl"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                      <img
                        src={getProductDisplayImage(relatedProduct)}
                        alt={relatedProduct.name}
                        className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const imageName = getProductDisplayImage(relatedProduct).split("/").pop();
                          e.target.src = `/products/${imageName}`;
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="mb-1 text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-orange-600 transition">
                        {relatedProduct.name}
                      </h3>
                      <p className="mb-2 text-xs text-slate-500">
                        {relatedProduct.category}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-orange-600">
                          ₹{relatedProduct.price.toLocaleString()}
                        </span>
                        <span className="text-xs font-medium text-slate-600 group-hover:text-orange-600 transition">
                          View →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;
