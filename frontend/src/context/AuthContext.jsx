import { createContext, useContext, useMemo, useState } from "react";
import { authApi, parseApiError } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
  const [loading, setLoading] = useState(false);
  const isAuthenticated = Boolean(token);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await authApi.login({ username, password });
      const nextToken = response.data.access_token;
      localStorage.setItem("admin_token", nextToken);
      setToken(nextToken);
      return { success: true };
    } catch (error) {
      return { success: false, message: parseApiError(error) };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken("");
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      loading,
      login,
      logout,
    }),
    [token, isAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
