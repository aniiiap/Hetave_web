import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

function GoogleCallbackPage() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userParam = params.get("user");
    const redirect = params.get("redirect") || "/products";

    try {
      if (token && userParam) {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem("hetave_token", token);
        localStorage.setItem("hetave_user", JSON.stringify(user));
        toast.success("Logged in with Google");
      } else {
        toast.error("Google login did not return expected data.");
      }
    } catch (error) {
      console.error("Error handling Google callback:", error);
      toast.error("Error completing Google login.");
    } finally {
      // Full redirect so AuthContext picks up new localStorage on reload
      window.location.href = redirect || "/products";
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
        <p className="mt-4 text-slate-600">Completing Google login...</p>
      </div>
    </div>
  );
}

export default GoogleCallbackPage;


