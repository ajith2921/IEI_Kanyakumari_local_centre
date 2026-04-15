import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api";
const UPLOADS_BASE_URL =
  import.meta.env.VITE_UPLOADS_BASE_URL || "http://localhost:8000";

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
  const membershipToken = localStorage.getItem("membership_token") || "";
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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  getMemberById: (id) => api.get(`/members/${id}`),
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
    updateStatus: (id, status) => api.patch(`/membership/${id}/status`, { status }),
    remove: (id) => api.delete(`/membership/${id}`),
  },
  imageAudit: {
    list: () => api.get("/image-audit"),
    autoFix: (entity, id) => api.post(`/image-audit/auto-fix/${entity}/${id}`),
  },
};

export default api;
