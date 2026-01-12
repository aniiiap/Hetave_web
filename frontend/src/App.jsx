import "./index.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Header from "./components/Header.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Footer from "./components/Footer.jsx";

// Lazy load pages for code splitting
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const ServicesPage = lazy(() => import("./pages/ServicesPage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage.jsx"));
const ProductsPage = lazy(() => import("./pages/ProductsPage.jsx"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage.jsx"));
const CartPage = lazy(() => import("./pages/CartPage.jsx"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const GoogleCallbackPage = lazy(() => import("./pages/GoogleCallbackPage.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));

// Loading component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
      <p className="mt-4 text-slate-600">Loading...</p>
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="site-root flex min-h-screen flex-col bg-white text-slate-900">
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#1e293b",
            borderRadius: "0.75rem",
            border: "1px solid #e2e8f0",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            padding: "16px",
            fontSize: "14px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
            style: {
              border: "1px solid #10b981",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            style: {
              border: "1px solid #ef4444",
            },
          },
        }}
      />
      {!isLoginPage && <Header />}
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/products" element={<CategoriesPage />} />
            <Route path="/products/category/:categoryName" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/google-callback" element={<GoogleCallbackPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </main>
      {!isLoginPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

