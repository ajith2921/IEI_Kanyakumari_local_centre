import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { authApi, parseApiError } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Only hit the backend if an admin_token cookie is present.
      // This prevents every anonymous public visitor from triggering a
      // backend request (and waking the Render free-tier service).
      const hasToken = document.cookie
        .split(";")
        .some((c) => c.trim().startsWith("admin_token="));

      if (!hasToken) {
        // No session cookie — definitely not logged in, skip the network call
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.me();
        setIsAuthenticated(true);
        setUser(response.data);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      await authApi.login({ username, password });
      const meResponse = await authApi.me();
      setIsAuthenticated(true);
      setUser(meResponse.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: parseApiError(error) };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Swallow logout errors — session cleanup happens regardless
    }
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      loading,
      login,
      logout,
    }),
    [isAuthenticated, user, loading, login, logout]
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
