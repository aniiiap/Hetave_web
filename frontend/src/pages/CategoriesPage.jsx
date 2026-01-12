import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Define the order of categories (top to bottom of human body)
  const categoryOrder = [
    "Head Protection",
    "Eye Protection",
    "Safety Mask",
    "Hearing Protection",
    "Body Protection",
    "Hand Protection",
    "Foot Protection",
    "Fire Safety",
    "Safety Ladder",
    "Safety Tape",
  ];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Check cache first
      const cachedCategories = sessionStorage.getItem("hetave_categories");
      const cacheTime = sessionStorage.getItem("hetave_categories_time");
      const now = Date.now();
      
      if (cachedCategories && cacheTime && (now - parseInt(cacheTime)) < 5 * 60 * 1000) {
        try {
          const parsed = JSON.parse(cachedCategories);
          const sortedCategories = parsed.sort((a, b) => {
            const indexA = categoryOrder.indexOf(a.name);
            const indexB = categoryOrder.indexOf(b.name);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          setCategories(sortedCategories);
          setLoading(false);
          // Fetch in background to update cache
          fetch(`${API_URL}/api/categories`, { cache: 'default' })
            .then(res => res.json())
            .then(data => {
              if (data.success && data.categories) {
                sessionStorage.setItem("hetave_categories", JSON.stringify(data.categories));
                sessionStorage.setItem("hetave_categories_time", now.toString());
                const sorted = data.categories.sort((a, b) => {
                  const indexA = categoryOrder.indexOf(a.name);
                  const indexB = categoryOrder.indexOf(b.name);
                  if (indexA === -1) return 1;
                  if (indexB === -1) return -1;
                  return indexA - indexB;
                });
                setCategories(sorted);
              }
            })
            .catch(() => {}); // Silent fail for background update
          return;
        } catch (e) {
          sessionStorage.removeItem("hetave_categories");
          sessionStorage.removeItem("hetave_categories_time");
        }
      }
      
      const response = await fetch(`${API_URL}/api/categories`, {
        cache: 'default'
      });
      const data = await response.json();
      if (data.success) {
        const fetchedCategories = data.categories || [];
        // Sort categories according to body order (top to bottom)
        const sortedCategories = fetchedCategories.sort((a, b) => {
          const indexA = categoryOrder.indexOf(a.name);
          const indexB = categoryOrder.indexOf(b.name);
          // If category is not in the order list, put it at the end
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        setCategories(sortedCategories);
        // Cache the categories
        sessionStorage.setItem("hetave_categories", JSON.stringify(fetchedCategories));
        sessionStorage.setItem("hetave_categories_time", now.toString());
      } else {
        console.error("Error fetching categories:", data.message);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Hero Section */}
      <section className="relative h-[300px] sm:h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/images/front-view-worker-uniform-holding-hard-hat.jpg)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Our Products
            </h1>
            <p className="text-lg sm:text-xl text-slate-200">
              Certified PPE & Safety Solutions
            </p>
          </div>
        </div>
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
            <span className="text-slate-900 font-medium">Products</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Product Categories
          </h2>
          <p className="text-lg text-slate-600">
            Explore our comprehensive range of safety equipment and personal protective gear
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Loading categories...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
            <Link
              key={category.id || category.name}
              to={`/products/category/${encodeURIComponent(category.name)}`}
              className="group relative overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-orange-500 hover:shadow-xl"
            >
              {/* Category Image */}
              <div className="relative h-48 sm:h-64 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-20 w-20 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-slate-500">Image Coming Soon</p>
                    </div>
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>

              {/* Category Info */}
              <div className="p-4 sm:p-6">
                <h3 className="mb-2 text-lg sm:text-xl font-bold text-slate-900 group-hover:text-orange-600 transition">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mb-4 text-xs sm:text-sm text-slate-600 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center text-orange-600 font-semibold">
                  <span className="text-sm">View Products</span>
                  <svg
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
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
                </div>
              </div>

              {/* Accent Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Link>
            ))}
          </div>
        )}
        {!loading && categories.length === 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto max-w-md">
              <svg
                className="mx-auto h-16 w-16 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No categories available
              </h3>
              <p className="mt-2 text-slate-600">
                Categories will appear here once they are added.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoriesPage;

