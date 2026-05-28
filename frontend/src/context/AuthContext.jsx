import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { authApi, parseApiError } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authApi.me();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
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
      setIsAuthenticated(true);
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
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      loading,
      login,
      logout,
    }),
    [isAuthenticated, loading, login, logout]
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
