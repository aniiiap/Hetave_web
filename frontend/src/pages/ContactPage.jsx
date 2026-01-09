import { FiPhone, FiMail, FiMapPin, FiSend } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

function ContactPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  if (!loading && isAdmin) {
    return null;
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5002";
      const response = await fetch(`${apiUrl}/api/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || "Thank you! Your message has been sent successfully.");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error(error.message || "There was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 text-center">
          <p className="mb-1 text-md font-bold uppercase tracking-[0.2em] text-orange-500">
            Get in Touch
          </p>
          <h1 className="mb-6 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Contact <span className="text-orange-500">Us</span>
          </h1>
          <p className="mx-auto max-w-3xl text-base text-slate-600 sm:text-lg">
            Have questions about our PPE products or insurance services? We're here to help. Reach out to us and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Contact Information */}
            <div>
              <h2 className="mb-6 text-2xl font-semibold text-slate-900">
                Contact Information
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-slate-600 sm:text-base">
                Get in touch with us through any of the following channels. Our team is ready to assist you with your PPE and insurance needs.
              </p>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                    <FiPhone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-slate-900">Phone</h3>
                    <p className="text-sm text-slate-600">
                      <a href="tel:+918095289835" className="hover:text-orange-500 transition">
                        +91 80952 89835
                      </a>
                    </p>
                    <p className="text-sm text-slate-600">
                      <a href="tel:+917624818724" className="hover:text-orange-500 transition">
                        +91 76248 18724
                      </a>
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                    <FiMail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-slate-900">Email</h3>
                    <p className="text-sm text-slate-600">
                      <a
                        href="mailto:sales@hetave.co.in"
                        className="hover:text-orange-500 transition"
                      >
                        sales@hetave.co.in
                      </a>
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                    <FiMapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-slate-900">Address</h3>
                    <p className="text-sm text-slate-600">
                      292, Rama Vihar,<br />
                      Bhilwara, Rajasthan - 311001
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="mb-6 text-2xl font-semibold text-slate-900">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+91 12345 67890"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700 hover:shadow-xl disabled:opacity-50"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <FiSend className="mr-2 inline h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;

