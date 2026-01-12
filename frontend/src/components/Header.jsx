import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FiLogIn, FiLogOut, FiUser, FiChevronDown, FiMenu, FiX } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

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

function Header() {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsDropdown, setMobileProductsDropdown] = useState(false);

  // Fetch categories on mount with caching
  useEffect(() => {
    let isMounted = true;
    
    // Check if we have cached categories (valid for 5 minutes)
    const cachedCategories = sessionStorage.getItem("hetave_categories");
    const cacheTime = sessionStorage.getItem("hetave_categories_time");
    const now = Date.now();
    
    const loadFromCache = () => {
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
          if (isMounted) {
            setCategories(sortedCategories);
          }
          return true; // Cache was used
        } catch {
          // If cache is corrupted, fetch fresh data
          sessionStorage.removeItem("hetave_categories");
          sessionStorage.removeItem("hetave_categories_time");
        }
      }
      return false; // Cache not used
    };
    
    const cacheUsed = loadFromCache();
    
    // Fetch fresh categories (always fetch to update cache, but use cache immediately)
    (async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories`, {
          cache: 'default' // Use browser cache
        });
        const data = await response.json();
        if (data.success && isMounted) {
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
          sessionStorage.setItem("hetave_categories_time", Date.now().toString());
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // If fetch fails and we have cached data, use it
        if (!cacheUsed && cachedCategories && isMounted) {
          try {
            const parsed = JSON.parse(cachedCategories);
            setCategories(parsed);
          } catch {
            // Ignore parse errors
          }
        }
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);


  const basePath = location.pathname.split("/")[1]
    ? `/${location.pathname.split("/")[1]}`
    : "/";
  const currentTitle =
    basePath === "/"
      ? "Home"
      : basePath === "/about"
        ? "About"
        : basePath === "/services"
          ? "Services"
          : basePath === "/contact"
            ? "Contact"
            : basePath === "/products"
              ? "Products"
              : basePath === "/admin"
                ? "Admin"
                : "Hetave";

  return (
    <header
      className="
        fixed top-0 inset-x-0 z-50 
        flex items-center justify-between 
        px-[6vw] py-3 
        bg-white/80 backdrop-blur-md 
        border-b border-black/10 shadow
      "
    >
      {/* BRAND LOGO + TITLE */}
      <Link
        to="/"
        className="flex items-center gap-3 transition-opacity hover:opacity-80"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-950/90 overflow-hidden">
          <img
            src="/icons/Hetave_Logo-removebg-preview.png"
            alt="Hetave Logo"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="hidden sm:flex flex-col leading-tight">
          <span className="text-[0.9rem] font-semibold uppercase tracking-[0.12em] text-slate-800">
            Hetave Enterprises
          </span>
          <span className="text-[0.7rem] uppercase tracking-[0.16em] text-slate-500">
            {currentTitle}
          </span>
        </div>
      </Link>

      {/* NAVIGATION - Desktop */}
      <nav className="hidden md:flex items-center gap-5 text-[0.9rem] font-medium">
        {isAdmin ? (
          // Admin navigation - simplified
          <>
            <Link
              to="/admin/dashboard"
              className={`rounded-lg px-3 py-2 text-slate-700 opacity-80 transition hover:bg-slate-100 hover:opacity-100 hover:text-orange-500 ${
                location.pathname.startsWith("/admin") ? "bg-orange-100 text-orange-600 opacity-100 font-semibold" : ""
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/products"
              className="text-slate-700 opacity-80 hover:opacity-100 hover:text-orange-500 transition"
            >
              Products
            </Link>
          </>
        ) : (
          // Regular user navigation
          <>
            <Link
              to="/"
              className="text-slate-700 opacity-80 hover:opacity-100 hover:text-orange-500 transition"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-slate-700 opacity-80 hover:opacity-100 hover:text-orange-500 transition"
            >
              About
            </Link>
            <Link
              to="/services"
              className="text-slate-700 opacity-80 hover:opacity-100 hover:text-orange-500 transition"
            >
              Services
            </Link>
            <div
              className="relative"
              onMouseEnter={() => {
                // Clear any pending timeout
                if (dropdownTimeout) {
                  clearTimeout(dropdownTimeout);
                  setDropdownTimeout(null);
                }
                setShowProductsDropdown(true);
              }}
              onMouseLeave={() => {
                // Add a small delay before hiding to allow moving to dropdown
                const timeout = setTimeout(() => {
                  setShowProductsDropdown(false);
                }, 150); // 150ms delay
                setDropdownTimeout(timeout);
              }}
            >
              <Link
                to="/products"
                className="flex items-center gap-1 text-slate-700 opacity-80 hover:opacity-100 hover:text-orange-500 transition"
              >
                Products
                <FiChevronDown className={`h-4 w-4 transition-transform ${showProductsDropdown ? 'rotate-180' : ''}`} />
              </Link>
              
              {/* Dropdown Menu - Desktop (hover) */}
              {showProductsDropdown && (
                <div 
                  className="hidden md:block absolute top-full left-0 mt-0 w-64 rounded-lg border border-slate-200 bg-white shadow-xl z-50 py-2"
                  onMouseEnter={() => {
                    // Clear timeout when entering dropdown
                    if (dropdownTimeout) {
                      clearTimeout(dropdownTimeout);
                      setDropdownTimeout(null);
                    }
                    setShowProductsDropdown(true);
                  }}
                  onMouseLeave={() => {
                    // Hide dropdown when leaving
                    setShowProductsDropdown(false);
                  }}
                >
                  {categories.length > 0 ? (
                    <>
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/products/category/${encodeURIComponent(category.name)}`}
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition"
                          onClick={() => setShowProductsDropdown(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                      <div className="border-t border-slate-200 my-1"></div>
                      <Link
                        to="/products"
                        className="block px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition"
                        onClick={() => setShowProductsDropdown(false)}
                      >
                        View All Categories
                      </Link>
                    </>
                  ) : (
                    <div className="px-4 py-2 text-sm text-slate-500">
                      No categories available
                    </div>
                  )}
                </div>
              )}
            </div>
            <Link
              to="/contact"
              className="text-slate-700 opacity-80 hover:opacity-100 hover:text-orange-500 transition"
            >
              Contact
            </Link>
          </>
        )}
        {user ? (
          <button
            onClick={logout}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 opacity-80 transition hover:bg-slate-100 hover:opacity-100 hover:text-orange-500"
            title="Logout"
          >
            <span>Logout</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 opacity-80 transition hover:bg-slate-100 hover:opacity-100 hover:text-orange-500"
            title="Login"
          >
            <span>Login</span>
          </Link>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-slate-700 hover:text-orange-500 transition"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[73px] z-40 bg-white border-b border-slate-200 shadow-lg md:hidden">
          <nav className="flex flex-col px-4 py-4 space-y-2">
            {isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-orange-500 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/products"
                  className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-orange-500 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-orange-500 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-orange-500 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/services"
                  className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-orange-500 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <div>
                  <button
                    onClick={() => setMobileProductsDropdown(!mobileProductsDropdown)}
                    className="w-full px-4 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-100 hover:text-orange-500 transition flex items-center justify-between"
                  >
                    Products
                    <FiChevronDown className={`h-4 w-4 transition-transform ${mobileProductsDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileProductsDropdown && categories.length > 0 && (
                    <div className="pl-4 border-l-2 border-orange-200 mt-1">
                      {categories.map((category) => (
                        <Link
                          key={category.id || category.name}
                          to={`/products/category/${encodeURIComponent(category.name)}`}
                          className="block px-4 py-2 text-sm text-slate-600 hover:text-orange-500 transition"
                          onClick={() => {
                            setMobileProductsDropdown(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {category.name}
                        </Link>
                      ))}
                      <Link
                        to="/products"
                        className="block px-4 py-2 text-sm font-semibold text-orange-600 hover:text-orange-500 transition"
                        onClick={() => {
                          setMobileProductsDropdown(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        View All Categories
                      </Link>
                    </div>
                  )}
                </div>
                <Link
                  to="/contact"
                  className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-orange-500 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </>
            )}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-100 hover:text-orange-500 transition"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-orange-500 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
