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
        className="relative h-[550px] sm:h-[650px] md:h-screen pt-20 md:pt-24 overflow-hidden"
      >
        {/* Background image - always visible, covering fully and stretched */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/images/360_F_1058726700_zeHnAZqb88WzHig0ZjVmGtIXjfNImOJI.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            minHeight: "100%",
            height: "100%",
          }}
        />
        
        {/* Gradient overlay - similar to About page style */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-orange-500/75 to-slate-900/20" />

        {/* Content wrapper */}
        <div className="relative z-10 flex h-full items-center justify-start">
          <div className="flex w-full px-5 sm:px-6 md:px-10 lg:pl-28 lg:pr-10">
            <div className="max-w-xl text-white pt-12 pb-12 sm:pt-14 sm:pb-14 md:pt-20 md:pb-20">
              <p className="mb-2 md:mb-3 text-xs md:text-xs font-semibold uppercase tracking-[0.2em] md:tracking-[0.22em] text-sky-300 md:text-sky-400">
                PPE &amp; Insurance, under one roof
              </p>
              <h1 className="mb-3 md:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Safer workplaces,
                <br />
                stronger protection.
              </h1>
              <p className="mb-4 md:mb-6 text-sm sm:text-sm md:text-base leading-relaxed text-white md:text-slate-100 sm:max-w-md">
                Hetave Enterprises delivers certified PPE safety products and tailored insurance
                solutions for factories, logistics, and businesses that can&apos;t afford downtime.
              </p>

              <div className="mb-4 md:mb-5 flex flex-row gap-2 md:gap-3">
                <Link
                  to="/products"
                  className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1.5 md:px-6 md:py-3 text-[11px] md:text-sm font-medium md:font-semibold text-white shadow-md md:shadow-lg transition hover:from-orange-600 hover:to-orange-700 hover:shadow-lg md:hover:shadow-xl text-center whitespace-nowrap"
                >
                  View Products
                </Link>
                <Link
                  to="/contact"
                  className="rounded-full border-2 border-white bg-white/20 backdrop-blur-sm px-3 py-1.5 md:px-6 md:py-3 text-[11px] md:text-sm font-medium md:font-semibold text-white transition hover:bg-white/30 hover:border-white text-center whitespace-nowrap"
                >
                  Contact Us
                </Link>
              </div>

              <p className="text-xs sm:text-xs md:text-sm text-white/90 md:text-slate-200 leading-relaxed">
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


