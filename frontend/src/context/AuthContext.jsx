import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("hetave_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("hetave_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("hetave_user");
    }
  }, [user]);

  const login = async ({ email, password, role }) => {
    // Admin login (hardcoded for now)
    if (role === "admin" || (email === "admin@hetave.com" && password === "admin123")) {
      const adminUser = {
        id: "admin",
        email: "admin@hetave.com",
        name: "Admin",
        role: "admin",
      };
      // Store admin token (for backend API calls)
      const adminToken = "admin_token_" + Date.now();
      localStorage.setItem("hetave_token", adminToken);
      setUser(adminUser);
      return { success: true, user: adminUser, token: adminToken };
    }

    // Regular user login - call backend API
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5002";
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        if (data.token) {
          localStorage.setItem("hetave_token", data.token);
        }
        return { success: true, user: data.user, token: data.token };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const signup = async ({ name, email, password }) => {
    // Call backend API
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5002";
      const response = await fetch(`${apiUrl}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        if (data.token) {
          localStorage.setItem("hetave_token", data.token);
        }
        return { success: true, user: data.user, token: data.token };
      } else {
        return { success: false, message: data.message || "Signup failed" };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hetave_user");
    localStorage.removeItem("hetave_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        loading,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
