import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiTarget, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";

function AboutPage() {
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
    <div className="pt-24">
      {/* Hero Banner Section */}
      <section className="relative h-[250px] sm:h-[300px] lg:h-[450px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url(/images/civil-engineer-safety-hat-with-clipboard-against-construction.jpg)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
              ABOUT <span className="text-orange-500">HETAVE</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-200">
              Trust, Quality, and Safety
            </p>
          </div>
        </div>
        {/* Separator line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500" />
      </section>

      {/* Welcome Section */}
      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <h2 className="mb-6 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Dear Valued Customers and Partners
          </h2>
          
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              We founded this company with a clear mission — to provide reliable, high-quality personal protective equipment that helps safeguard lives and support the operations of businesses across industries. In a world where safety is paramount, we take pride in being a trusted name committed to delivering products that meet the highest standards of protection and performance.
            </p>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              At Hetave Enterprises, trust and quality are more than just words — they are the foundation of everything we do. From sourcing certified materials to ensuring timely delivery, our team works tirelessly to uphold these values in every product and every relationship.
            </p>
            <p className="text-sm font-medium leading-relaxed text-slate-800 sm:text-base">
              Thank you for placing your confidence in us. We look forward to continuing our journey together — building safer workplaces and a more secure future for all.
            </p>
          </div>
        </div>
      </section>

      {/* Vision and Mission Cards */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-orange-50 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            {/* Vision Card */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-orange-100 bg-white p-8 shadow-lg transition-all duration-300 hover:border-orange-300 hover:shadow-2xl">
              <div className="absolute top-0 right-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 opacity-50 transition-transform duration-300 group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg">
                    <FiTarget className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                    Our Vision
                  </p>
                </div>
                <h2 className="mb-6 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Setting the Standard in Safety and Quality
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  To be the most trusted name in personal protective equipment, recognized for setting the standard in safety, quality, and customer confidence across every industry we serve.
                </p>
              </div>
            </div>

            {/* Mission Card */}
            <div className="group relative overflow-hidden rounded-2xl border-2 border-orange-100 bg-white p-8 shadow-lg transition-all duration-300 hover:border-orange-300 hover:shadow-2xl">
              <div className="absolute top-0 right-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 opacity-50 transition-transform duration-300 group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg">
                    <FiShield className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                    Our Mission
                  </p>
                </div>
                <h2 className="mb-6 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Safeguarding Lives Through Quality PPE
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  To provide high-quality, reliable personal protective equipment that safeguards lives and empowers businesses to operate safely. We are committed to building lasting relationships through exceptional service, unwavering trust, and a steadfast dedication to quality in every product we deliver.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
