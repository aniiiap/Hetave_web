import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/products";
  const action = location.state?.action; // "buy" if user was trying to buy

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Check if admin credentials
        if (
          formData.email === "admin@hetave.com" &&
          formData.password === "admin123"
        ) {
          const result = await login({ email: formData.email, role: "admin" });
        if (result.success) {
          toast.success("Welcome back, Admin!");
          navigate("/admin/dashboard", { replace: true });
        }
        return;
      }

      // Regular user login - call backend API
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        // Redirect based on action or from location
        if (action === "buy") {
          navigate("/checkout", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
          toast.success("Login successful!");
          navigate("/");
        } else {
          toast.error(result.message || "Invalid credentials");
        }
      } else {
        // Signup - call backend API
        if (!formData.name) {
          toast.error("Name is required");
          setLoading(false);
          return;
        }

        const result = await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        if (result.success) {
          toast.success("Account created successfully!");
          // Redirect based on action or from location
          if (action === "buy") {
            navigate("/checkout", { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        } else {
          toast.error(result.message || "Signup failed");
        }
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Save where to go after Google login
    const redirectPath = action === "buy" ? "/checkout" : from;
    sessionStorage.setItem("google_redirect_path", redirectPath);

    // Start server-side Google OAuth flow
    const state = encodeURIComponent(redirectPath);
    window.location.href = `${API_URL}/api/auth/google?state=${state}`;
  };

  return (
    <div className="fixed inset-0 flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-orange-50 pt-0">
      <div className="mx-auto flex h-full w-full max-w-md items-center justify-center px-4">
        {/* Login Form - Centered */}
        <div className="w-full">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-xl">
                {/* Header */}
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-bold text-slate-900">
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </h1>
                  <p className="mt-2 text-slate-600">
                    {isLogin
                      ? "Sign in to continue to Hetave"
                      : "Sign up to get started"}
                  </p>
                </div>

                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  type="button"
                  className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border-2 border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {isLogin ? "Continue with Google" : "Sign up with Google"}
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-slate-500">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required={!isLogin}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="John Doe"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 pr-12 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? (
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
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>


                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700 hover:shadow-xl disabled:opacity-50"
                  >
                    {loading
                      ? "Processing..."
                      : isLogin
                        ? "Sign In"
                        : "Create Account"}
                  </button>
                </form>

                {/* Toggle Login/Signup */}
                <div className="mt-6 text-center text-sm text-slate-600">
                  {isLogin ? (
                    <>
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(false);
                        }}
                        className="font-semibold text-orange-600 hover:text-orange-700"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(true);
                        }}
                        className="font-semibold text-orange-600 hover:text-orange-700"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
