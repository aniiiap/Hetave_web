import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiDollarSign,
  FiTool,
  FiBox,
  FiCreditCard,
  FiSettings,
  FiZap,
  FiHome,
  FiLayers,
  FiTruck,
  FiSend,
  FiUser,
  FiHeart,
  FiLock,
  FiPackage,
  FiNavigation,
  FiBriefcase,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";

const services = [
  {
    name: "Workmen Compensation Insurance",
    icon: FiTool,
    description: "Coverage for employees injured on the job",
  },
  {
    name: "Plant & Equipment All Risks Insurance",
    icon: FiHome,
    description: "Coverage for machinery, equipment, and plant facilities",
  },
  {
    name: "Health Insurance",
    icon: FiHeart,
    description: "Medical coverage for individuals and families",
  },
  {
    name: "Fire Insurance",
    icon: FiZap,
    description: "Protection against fire-related damages and losses",
  },
  {
    name: "Marine Insurance",
    icon: FiPackage,
    description: "Coverage for cargo and vessels during transit",
  },
  {
    name: "Motor Vehicle Insurance",
    icon: FiNavigation,
    description: "Comprehensive vehicle insurance coverage",
  },
  {
    name: "Public Liability Insurance",
    icon: FiDollarSign,
    description: "Protection against third-party claims for injury or property damage",
  },
  {
    name: "Industrial All Risks Insurance",
    icon: FiSettings,
    description: "Complete coverage for industrial operations and assets",
  },
  {
    name: "Erection All Risks Insurance",
    icon: FiLayers,
    description: "Protection during construction and installation projects",
  },
  {
    name: "Contractors All Risks Insurance",
    icon: FiTruck,
    description: "Comprehensive coverage for contractors and construction work",
  },
  {
    name: "Travel Accident Insurance",
    icon: FiSend,
    description: "Protection for accidents during business or personal travel",
  },
  {
    name: "Personal Accident Insurance",
    icon: FiUser,
    description: "Coverage for accidental injuries and disabilities",
  },
  {
    name: "Burglary Insurance",
    icon: FiLock,
    description: "Protection against theft and burglary",
  },
  {
    name: "Business Interruption Insurance",
    icon: FiBriefcase,
    description: "Coverage for lost income during business disruptions",
  },
  {
    name: "Money Insurance",
    icon: FiCreditCard,
    description: "Protection for cash, cheques, and valuable documents",
  },
  {
    name: "Other Services Insurance",
    icon: FiBox,
    description: "Comprehensive coverage for miscellaneous services",
  },
];

function ServicesPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  if (!loading && isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 bg-white">
      {/* Hero Banner Section */}
      <section className="relative h-[180px] sm:h-[220px] lg:h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              OUR <span className="text-orange-500">SERVICES</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-200">
              We provide all kind of General Insurance under the one roof of ICICI Lombard.
            </p>
          </div>
        </div>
        {/* Separator line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />
      </section>

      {/* Services Grid */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10 lg:grid-cols-4 lg:gap-12">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="group flex flex-col items-center text-center px-4 py-6 transition hover:scale-105"
                >
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-900 transition group-hover:border-orange-500 group-hover:bg-orange-500 sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                    <IconComponent className="h-10 w-10 text-white transition group-hover:text-white sm:h-12 sm:w-12 lg:h-14 lg:w-14" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 sm:text-sm">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-50 to-slate-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-8 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900 sm:text-3xl">
            Need Help Choosing the Right Insurance?
          </h2>
          <p className="mb-8 text-base text-slate-600 sm:text-lg">
            Our expert team is here to help you find the perfect insurance solution for your needs.
          </p>
          <Link
            to="/contact"
            className="inline-block rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700 hover:shadow-xl"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}

export default ServicesPage;
