import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api";
const UPLOADS_BASE_URL =
  import.meta.env.VITE_UPLOADS_BASE_URL || "http://localhost:8000";

export const MEMBERSHIP_TOKEN_KEY = "membership_token";
export const MEMBERSHIP_REFRESH_TOKEN_KEY = "membership_refresh_token";
export const MEMBERSHIP_USER_KEY = "membership_user";

export const toAbsoluteUploadUrl = (url = "") => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
  return `${UPLOADS_BASE_URL}${url}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

const multipartConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

const membershipAuthConfig = (extraConfig = {}) => {
  const membershipToken = localStorage.getItem(MEMBERSHIP_TOKEN_KEY) || "";
  const headers = {
    ...(extraConfig.headers || {}),
    ...(membershipToken ? { Authorization: `Bearer ${membershipToken}` } : {}),
  };

  return {
    ...extraConfig,
    headers,
  };
};

const isFormDataPayload = (payload) =>
  typeof FormData !== "undefined" && payload instanceof FormData;

const postWithOptionalMultipart = (url, payload) =>
  isFormDataPayload(payload) ? api.post(url, payload, multipartConfig) : api.post(url, payload);

const putWithOptionalMultipart = (url, payload) =>
  isFormDataPayload(payload) ? api.put(url, payload, multipartConfig) : api.put(url, payload);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  config.headers = config.headers || {};
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const clearMembershipSessionStorage = () => {
  localStorage.removeItem(MEMBERSHIP_TOKEN_KEY);
  localStorage.removeItem(MEMBERSHIP_REFRESH_TOKEN_KEY);
  localStorage.removeItem(MEMBERSHIP_USER_KEY);
};

const isMembershipProtectedRequest = (config) => {
  const url = String(config?.url || "");
  if (!url.includes("/membership-portal/")) {
    return false;
  }

  return !url.includes("/membership-portal/token/refresh") && !url.includes("/membership-portal/logout");
};

const requestMembershipTokenRefresh = async () => {
  const refreshToken = localStorage.getItem(MEMBERSHIP_REFRESH_TOKEN_KEY) || "";
  if (!refreshToken) {
    throw new Error("Membership refresh token not found.");
  }

  const response = await api.post(
    "/membership-portal/token/refresh",
    { refresh_token: refreshToken },
    { _skipMembershipRefresh: true }
  );

  const nextAccessToken = String(response.data?.access_token || "");
  const nextRefreshToken = String(response.data?.refresh_token || "");
  if (!nextAccessToken || !nextRefreshToken) {
    throw new Error("Membership token refresh response is incomplete.");
  }

  localStorage.setItem(MEMBERSHIP_TOKEN_KEY, nextAccessToken);
  localStorage.setItem(MEMBERSHIP_REFRESH_TOKEN_KEY, nextRefreshToken);

  const nextMember = response.data?.member;
  if (nextMember && typeof nextMember === "object") {
    localStorage.setItem(MEMBERSHIP_USER_KEY, JSON.stringify(nextMember));
  }

  return response.data;
};

let membershipRefreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (
      originalRequest._skipMembershipRefresh ||
      originalRequest._retry ||
      error.response?.status !== 401 ||
      !isMembershipProtectedRequest(originalRequest)
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(MEMBERSHIP_REFRESH_TOKEN_KEY) || "";
    if (!refreshToken) {
      clearMembershipSessionStorage();
      return Promise.reject(error);
    }

    try {
      originalRequest._retry = true;

      if (!membershipRefreshPromise) {
        membershipRefreshPromise = requestMembershipTokenRefresh().finally(() => {
          membershipRefreshPromise = null;
        });
      }

      const refreshed = await membershipRefreshPromise;
      const updatedAccessToken =
        String(refreshed?.access_token || "") || localStorage.getItem(MEMBERSHIP_TOKEN_KEY) || "";

      if (!updatedAccessToken) {
        throw new Error("Unable to refresh membership access token.");
      }

      originalRequest.headers = {
        ...(originalRequest.headers || {}),
        Authorization: `Bearer ${updatedAccessToken}`,
      };

      return api.request(originalRequest);
    } catch (refreshError) {
      clearMembershipSessionStorage();
      return Promise.reject(refreshError);
    }
  }
);

export const parseApiError = (error) => {
  if (error.response?.data?.detail) {
    if (typeof error.response.data.detail === "string") {
      return error.response.data.detail;
    }
    return JSON.stringify(error.response.data.detail);
  }
  return error.message || "Unexpected error";
};

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
};

export const publicApi = {
  getMembers: () => api.get("/members"),
  getGallery: () => api.get("/gallery"),
  getNewsletters: () => api.get("/newsletters"),
  getActivities: () => api.get("/activities"),
  getFacilities: () => api.get("/facilities"),
  getDownloads: () => api.get("/downloads"),
  submitContact: (payload) => api.post("/contact", payload),
  submitMembership: (payload) => api.post("/membership", payload),
  membershipRegister: (payload) => api.post("/register", payload),
  membershipLogin: (payload) => api.post("/login", payload),
  membershipForgotPassword: (payload) => api.post("/forgot-password", payload),
  membershipResetPassword: (payload) => api.post("/membership-portal/reset-password", payload),
  membershipRefresh: (payload) =>
    api.post("/membership-portal/token/refresh", payload, { _skipMembershipRefresh: true }),
  membershipLogout: () =>
    api.post(
      "/membership-portal/logout",
      {},
      membershipAuthConfig({ _skipMembershipRefresh: true })
    ),
  getMembershipProfile: () => api.get("/membership-portal/profile", membershipAuthConfig()),
  getMembershipCpdHistory: () => api.get("/membership-portal/cpd-history", membershipAuthConfig()),
  downloadMembershipCertificate: () =>
    api.get(
      "/membership-portal/certificate",
      membershipAuthConfig({ responseType: "blob" })
    ),
};

export const adminApi = {
  members: {
    list: () => api.get("/members"),
    create: (payload) => postWithOptionalMultipart("/members", payload),
    update: (id, payload) => putWithOptionalMultipart(`/members/${id}`, payload),
    remove: (id) => api.delete(`/members/${id}`),
  },
  activities: {
    list: () => api.get("/activities"),
    create: (payload) => postWithOptionalMultipart("/activities", payload),
    update: (id, payload) => putWithOptionalMultipart(`/activities/${id}`, payload),
    remove: (id) => api.delete(`/activities/${id}`),
  },
  facilities: {
    list: () => api.get("/facilities"),
    create: (payload) => postWithOptionalMultipart("/facilities", payload),
    update: (id, payload) => putWithOptionalMultipart(`/facilities/${id}`, payload),
    remove: (id) => api.delete(`/facilities/${id}`),
  },
  gallery: {
    list: () => api.get("/gallery"),
    create: (formData) => postWithOptionalMultipart("/gallery", formData),
    remove: (id) => api.delete(`/gallery/${id}`),
  },
  newsletters: {
    list: () => api.get("/newsletters"),
    create: (formData) => postWithOptionalMultipart("/newsletters", formData),
    update: (id, formData) => putWithOptionalMultipart(`/newsletters/${id}`, formData),
    remove: (id) => api.delete(`/newsletters/${id}`),
  },
  downloads: {
    list: () => api.get("/downloads"),
    create: (formData) => postWithOptionalMultipart("/downloads", formData),
    update: (id, formData) => putWithOptionalMultipart(`/downloads/${id}`, formData),
    remove: (id) => api.delete(`/downloads/${id}`),
  },
  contacts: {
    list: () => api.get("/contact"),
    remove: (id) => api.delete(`/contact/${id}`),
  },
  membership: {
    list: () => api.get("/membership"),
    updateStatus: (id, status, reviewNotes = "") =>
      api.patch(`/membership/${id}/status`, { status, review_notes: reviewNotes }),
    remove: (id) => api.delete(`/membership/${id}`),
  },
  imageAudit: {
    list: () => api.get("/image-audit"),
    autoFix: (entity, id) => api.post(`/image-audit/auto-fix/${entity}/${id}`),
  },
};

export default api;
