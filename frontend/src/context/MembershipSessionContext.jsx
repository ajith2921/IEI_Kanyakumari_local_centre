import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  MEMBERSHIP_REFRESH_TOKEN_KEY,
  MEMBERSHIP_TOKEN_KEY,
  MEMBERSHIP_USER_KEY,
  parseApiError,
  publicApi,
} from "../services/api";

const CONTEXT_GLOBAL_KEY = "__ieiMembershipSessionContext";
const globalScope = globalThis;
const MembershipSessionContext =
  globalScope[CONTEXT_GLOBAL_KEY] || createContext(null);

if (!globalScope[CONTEXT_GLOBAL_KEY]) {
  globalScope[CONTEXT_GLOBAL_KEY] = MembershipSessionContext;
}

function readStoredMember() {
  const raw = localStorage.getItem(MEMBERSHIP_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    localStorage.removeItem(MEMBERSHIP_USER_KEY);
    return null;
  }
}

export function MembershipSessionProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(MEMBERSHIP_TOKEN_KEY) || "");
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem(MEMBERSHIP_REFRESH_TOKEN_KEY) || ""
  );
  const [member, setMember] = useState(readStoredMember);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(token && refreshToken && member?.id);

  const clearStoredSession = useCallback(() => {
    localStorage.removeItem(MEMBERSHIP_TOKEN_KEY);
    localStorage.removeItem(MEMBERSHIP_REFRESH_TOKEN_KEY);
    localStorage.removeItem(MEMBERSHIP_USER_KEY);
    setToken("");
    setRefreshToken("");
    setMember(null);
  }, []);

  useEffect(() => {
    if (token && !refreshToken) {
      clearStoredSession();
    }
  }, [token, refreshToken, clearStoredSession]);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const response = await publicApi.membershipLogin({ identifier, password });
      const nextToken = String(response.data?.access_token || "");
      const nextRefreshToken = String(response.data?.refresh_token || "");
      const nextMember = response.data?.member || null;

      if (!nextToken || !nextRefreshToken || !nextMember?.id) {
        return { success: false, message: "Login response is incomplete." };
      }

      localStorage.setItem(MEMBERSHIP_TOKEN_KEY, nextToken);
      localStorage.setItem(MEMBERSHIP_REFRESH_TOKEN_KEY, nextRefreshToken);
      localStorage.setItem(MEMBERSHIP_USER_KEY, JSON.stringify(nextMember));
      setToken(nextToken);
      setRefreshToken(nextRefreshToken);
      setMember(nextMember);

      return { success: true };
    } catch (error) {
      return { success: false, message: parseApiError(error) };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (token && refreshToken) {
        await publicApi.membershipLogout();
      }
    } catch {
      // Local cleanup is still performed even if remote token revoke fails.
    } finally {
      clearStoredSession();
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      token,
      refreshToken,
      member,
      loading,
      isAuthenticated,
      login,
      logout,
    }),
    [token, refreshToken, member, loading, isAuthenticated]
  );

  return (
    <MembershipSessionContext.Provider value={value}>{children}</MembershipSessionContext.Provider>
  );
}

export function useMembershipSession() {
  const context = useContext(MembershipSessionContext);
  if (!context) {
    throw new Error("useMembershipSession must be used within MembershipSessionProvider");
  }
  return context;
}
