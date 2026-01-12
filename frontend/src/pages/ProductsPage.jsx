import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

const CATEGORIES = [
  "All Products",
  "Head Protection",
  "Eye Protection",
  "Safety Mask",
  "Hearing Protection",
  "Hand Protection",
  "Foot Protection",
  "Body Protection",
  "Fire Safety",
  "Safety Ladder",
  "Safety Tape",
];

function ProductsPage() {
  const { categoryName } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(categoryName || "All Products");
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Update selected category when URL param changes - this takes priority over localStorage
  useEffect(() => {
    if (categoryName) {
      const decodedCategory = decodeURIComponent(categoryName);
      setSelectedCategory(decodedCategory);
      // Clear localStorage when URL param is present to avoid conflicts
      localStorage.removeItem("hetave_products_category");
    } else {
      setSelectedCategory("All Products");
    }
  }, [categoryName]);

  // Helper: determine if product should be marked as "New"
  const isNewProduct = (product) => {
    if (!product.createdAt) return false;
    const created = new Date(product.createdAt);
    if (Number.isNaN(created.getTime())) return false;

    const now = new Date();
    const diffInMs = now - created;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    // Mark as new if added within the last 30 days
    return diffInDays <= 30;
  };

  // Helper: get display image (first color image if available, otherwise main image)
  const getProductDisplayImage = (product) => {
    if (product.colors && product.colors.length > 0 && product.colors[0].image) {
      return product.colors[0].image;
    }
    return product.image;
  };

  useEffect(() => {
    fetchProducts();
    
    // Preload the hero banner image
    const img = new Image();
    img.src = "/images/front-view-worker-uniform-holding-hard-hat.jpg";
  }, []);

  // Load saved sort preference on mount (but NOT category - category comes from URL)
  useEffect(() => {
    const savedSort = localStorage.getItem("hetave_products_sort");
    if (savedSort) {
      setSortBy(savedSort);
    }
  }, []);

  // Persist view preferences (only sort, not category - category is from URL)
  // Don't persist category to localStorage when it comes from URL

  useEffect(() => {
    localStorage.setItem("hetave_products_sort", sortBy);
  }, [sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        console.error("Error fetching products:", data.message);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      toast.error("Unable to load products. Please check if the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  // Filter + sort products
  const filteredProducts = useMemo(() => {
    let list = products.filter((product) => {
      const isOutOfStock = !product.inStock;

      // Category filter
      const matchesCategory =
        selectedCategory === "All Products" || product.category === selectedCategory;

      // In-stock filter
      const matchesStock = !onlyInStock || !isOutOfStock;

      // Price filter
      const min = priceMin ? parseFloat(priceMin) : null;
      const max = priceMax ? parseFloat(priceMax) : null;
      const matchesPrice =
        (!min || product.price >= min) && (!max || product.price <= max);

      // Search filter
      if (!searchQuery.trim()) {
        return matchesCategory && matchesStock && matchesPrice;
      }

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.brand && product.brand.toLowerCase().includes(query)) ||
        (product.description && product.description.toLowerCase().includes(query));

      return matchesCategory && matchesStock && matchesPrice && matchesSearch;
    });

    // Apply sorting (keep "default" as original database order)
    if (sortBy !== "default") {
      list = [...list].sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "category-asc":
            return a.category.localeCompare(b.category);
          case "category-desc":
            return b.category.localeCompare(a.category);
          case "date-desc":
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return 0;
          case "date-asc":
            if (a.createdAt && b.createdAt) {
              return new Date(a.createdAt) - new Date(b.createdAt);
            }
            return 0;
          default:
            return 0;
        }
      });
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy, onlyInStock, priceMin, priceMax]);

  const toggleProductVariants = (productId) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };


  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Hero Banner Section */}
      <section className="relative h-[250px] sm:h-[300px] lg:h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-slate-800"
          style={{
            backgroundImage:
              "url(/images/front-view-worker-uniform-holding-hard-hat.jpg)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              {selectedCategory !== "All Products" ? selectedCategory : "Our Products"}
            </h1>
            <p className="text-lg sm:text-xl text-slate-200">
              {selectedCategory !== "All Products" 
                ? `Explore our ${selectedCategory} collection`
                : "Certified PPE & Safety Solutions"}
            </p>
          </div>
        </div>
        {/* Separator line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />
      </section>

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
            {selectedCategory !== "All Products" && (
              <>
                <span className="text-slate-400">/</span>
                <span className="text-slate-900 font-medium">{selectedCategory}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back to Categories Link */}
        {selectedCategory !== "All Products" && (
          <div className="mb-6">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to All Categories
            </Link>
          </div>
        )}

        {/* Category pills - only show if viewing all products */}
        {selectedCategory === "All Products" && (
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-[0.2em] text-slate-700 uppercase">
                Categories
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 pb-2">
              {CATEGORIES.filter(cat => cat !== "All Products").map((category) => {
                return (
                  <Link
                    key={category}
                    to={`/products/category/${encodeURIComponent(category)}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-600"
                  >
                    {category}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Content - Products Grid */}
        <div className="">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {selectedCategory}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {loading
                ? "Loading products..."
                : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Search + Sort Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="w-full sm:flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products by name, category, brand, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 pl-11 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <svg
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                )}
              </div>
              {searchQuery && (
                <div className="mt-2 text-sm text-slate-600">
                  Showing results for "{searchQuery}"
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 sm:w-auto">
              <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:w-56"
              >
                <option value="default">Default Order</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="category-asc">Category (A-Z)</option>
                <option value="category-desc">Category (Z-A)</option>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Price & stock filters + quick chips */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="mt-1 w-28 rounded-lg border-2 border-slate-300 px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="mt-1 w-28 rounded-lg border-2 border-slate-300 px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700 sm:mt-6">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span>Only show in-stock items</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSortBy("date-desc")}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  sortBy === "date-desc"
                    ? "bg-orange-500 text-white"
                    : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                }`}
              >
                Newest
              </button>
              <button
                type="button"
                onClick={() => setSortBy("price-asc")}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  sortBy === "price-asc"
                    ? "bg-orange-500 text-white"
                    : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                }`}
              >
                Budget Friendly
              </button>
              <button
                type="button"
                onClick={() => setSortBy("price-desc")}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  sortBy === "price-desc"
                    ? "bg-orange-500 text-white"
                    : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                }`}
              >
                Premium First
              </button>
            </div>
          </div>

          {/* Active filter summary */}
          <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Filters:</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Category: {selectedCategory}
            </span>
            {onlyInStock && (
              <span className="rounded-full bg-slate-100 px-3 py-1">In Stock Only</span>
            )}
            {(priceMin || priceMax) && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Price
                {priceMin && ` from ₹${priceMin}`}
                {priceMax && ` to ₹${priceMax}`}
              </span>
            )}
            {sortBy !== "default" && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Sort: {sortBy.replace("-", " ").toUpperCase()}
              </span>
            )}
            {searchQuery && (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Search: "{searchQuery}"
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                <p className="mt-4 text-slate-600">Loading products...</p>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-orange-400 hover:shadow-2xl"
              >
                {/* Product Image Section */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
                  {/* Stock / new badges */}
                  {!product.inStock && (
                    <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow">
                      Out of Stock
                    </span>
                  )}
                  {isNewProduct(product) && (
                    <span className="absolute right-3 top-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow">
                      New
                    </span>
                  )}
                  <img
                    src={getProductDisplayImage(product)}
                    alt={product.name}
                    className="h-full w-full object-contain p-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      // Fallback to local image if remote image fails
                      const imageName = getProductDisplayImage(product).split("/").pop();
                      e.target.src = `/products/${imageName}`;
                    }}
                  />
                  {/* Hover overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  {/* View Details Button - appears on hover */}
                  <Link
                    to={`/products/${product.id}`}
                    className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg opacity-0 transition-all duration-300 hover:bg-orange-500 hover:text-white hover:scale-110 group-hover:opacity-100"
                  >
                    <svg
                      className="h-5 w-5 text-slate-700 transition-colors group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Product Info Section */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="text-center text-base font-bold text-slate-900 transition-colors group-hover:text-orange-600">
                      {product.name}
                    </h3>
                    <p className="mt-1.5 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
                      {product.category}
                    </p>
                  </div>

                    {/* Sizes */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="mb-2 flex flex-wrap justify-center gap-1">
                        {product.sizes.map((size, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Specifications Dropdown */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="mb-3 border-t border-slate-200 pt-3">
                      <button
                        onClick={() => toggleProductVariants(product.id)}
                        className="flex w-full items-center justify-between text-xs font-medium text-slate-600 hover:text-orange-600"
                      >
                          <span>View Specifications</span>
                        <svg
                          className={`h-4 w-4 transition-transform duration-200 ${
                            expandedProductId === product.id ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {expandedProductId === product.id && (
                        <div className="mt-2 space-y-1">
                          {product.variants.map((variant, idx) => (
                            <div
                              key={idx}
                                className="rounded bg-slate-50 px-3 py-1.5 text-xs text-red-600 font-medium"
                            >
                              {variant}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                    {/* Price */}
                    <div className="mb-3 text-center">
                      <span className="text-lg font-bold text-orange-600">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {!product.inStock && (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-red-600">
                          Currently Unavailable
                        </p>
                      )}
                    </div>

                  {/* View Details Button */}
                  <Link
                    to={`/products/${product.id}`}
                    className="mt-3 block w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:scale-105"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto max-w-md">
                <svg
                  className="mx-auto h-16 w-16 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {searchQuery ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  )}
                </svg>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {searchQuery
                    ? "No products found"
                    : selectedCategory === "All Products"
                      ? "No products available"
                      : "No products found in this category"}
                </h3>
                <p className="mt-2 text-slate-600">
                  {searchQuery
                    ? `No products match your search query "${searchQuery}". Try a different search term.`
                    : selectedCategory === "All Products"
                      ? "Products will appear here once they are added to the catalog."
                      : "Try selecting a different category or check back later."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;

