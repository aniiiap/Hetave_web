import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AboutSection from "../components/AboutSection.jsx";
import ProductsSection from "../components/ProductsSection.jsx";
import DistributorsSection from "../components/DistributorsSection.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

function HomePage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  // If admin, show admin dashboard (will redirect anyway, but this prevents flash)
  if (!loading && isAdmin) {
    return <AdminDashboard />;
  }

  // Regular home page for non-admin users
  return (
    <>
      <section
        className="relative h-screen pt-24 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url(/images/360_F_1058726700_zeHnAZqb88WzHig0ZjVmGtIXjfNImOJI.jpg)",
        }}
      >
        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-orange-500/75 to-slate-900/20" />

        {/* Left-side content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="flex w-full px-6 py-16 sm:px-10 lg:pl-28 lg:pr-10">
            <div className="max-w-xl text-white">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-sky-400">
                PPE &amp; Insurance, under one roof
              </p>
              <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                Safer workplaces,
                <br />
                stronger protection.
              </h1>
              <p className="mb-6 text-sm leading-relaxed text-slate-100 sm:text-base sm:max-w-md">
                Hetave Enterprises delivers certified PPE safety products and tailored insurance
                solutions for factories, logistics, and businesses that can&apos;t afford downtime.
              </p>

              <div className="mb-5 flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700 hover:shadow-xl"
                >
                  View Products
                </Link>
                <Link
                  to="/contact"
                  className="rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20 hover:border-white"
                >
                  Contact Us
                </Link>
              </div>

              <p className="text-xs text-slate-200 sm:text-sm">
                From fire, marine and motor to workmen compensation and health, we keep your people
                and assets protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AboutSection />
      <ProductsSection />
      <DistributorsSection />
    </>
  );
}

export default HomePage;


