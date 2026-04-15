import { createContext, useContext, useMemo, useState } from "react";
import { parseApiError, publicApi } from "../services/api";

const MembershipSessionContext = createContext(null);
const MEMBERSHIP_TOKEN_KEY = "membership_token";
const MEMBERSHIP_USER_KEY = "membership_user";

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
  const [member, setMember] = useState(readStoredMember);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(token && member?.id);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const response = await publicApi.membershipLogin({ identifier, password });
      const nextToken = String(response.data?.access_token || "");
      const nextMember = response.data?.member || null;

      if (!nextToken || !nextMember?.id) {
        return { success: false, message: "Login response is incomplete." };
      }

      localStorage.setItem(MEMBERSHIP_TOKEN_KEY, nextToken);
      localStorage.setItem(MEMBERSHIP_USER_KEY, JSON.stringify(nextMember));
      setToken(nextToken);
      setMember(nextMember);

      return { success: true };
    } catch (error) {
      return { success: false, message: parseApiError(error) };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(MEMBERSHIP_TOKEN_KEY);
    localStorage.removeItem(MEMBERSHIP_USER_KEY);
    setToken("");
    setMember(null);
  };

  const value = useMemo(
    () => ({
      token,
      member,
      loading,
      isAuthenticated,
      login,
      logout,
    }),
    [token, member, loading, isAuthenticated]
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
