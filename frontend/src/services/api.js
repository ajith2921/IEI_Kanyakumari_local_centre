import axios from "axios";
import axiosRetry from "axios-retry";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://iei-kanyakumari-backend.onrender.com/api" : "http://localhost:8000/api");
const UPLOADS_BASE_URL =
  import.meta.env.VITE_UPLOADS_BASE_URL || 
  (import.meta.env.PROD ? "https://iei-kanyakumari-backend.onrender.com" : "http://localhost:8000");

// ───────────────────────────────────────────────────────────────────────────
// Retry Configuration (Exponential Backoff)
// ───────────────────────────────────────────────────────────────────────────
const RETRY_CONFIG = {
  retries: 3,
  retryDelay: (retryCount) => {
    // Exponential backoff: 1s, 2s, 4s
    return Math.pow(2, retryCount - 1) * 1000;
  },
  retryCondition: (error) => {
    // Retry on network errors and 5xx status codes, NOT on 4xx
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           (error.response?.status >= 500);
  },
};

// ───────────────────────────────────────────────────────────────────────────
// Request Deduplication & Caching
// ───────────────────────────────────────────────────────────────────────────
const inflight = new Map(); // Track in-flight requests
const cache = new Map(); // Cache with TTL
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for general data
const CONFERENCE_CACHE_TTL = 30 * 60 * 1000; // 30 minutes for conference list
const ACTIVE_CONFERENCE_CACHE_TTL = 2 * 60 * 1000; // 2 minutes for active conference (admin changes must propagate fast)

function getCacheKey(url) {
  return `cache:${url}`;
}

function isValidCacheEntry(entry) {
  if (!entry) return false;
  return Date.now() - entry.timestamp < entry.ttl;
}

function getFromCache(key) {
  const entry = cache.get(key);
  if (isValidCacheEntry(entry)) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setInCache(key, data, ttl = CACHE_TTL) {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

// Wrapper to add deduplication & caching to GET requests
function cachedGet(url, ttl = CACHE_TTL) {
  const cacheKey = getCacheKey(url);
  
  // Check cache first
  const cached = getFromCache(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }
  
  // Check if request is in-flight
  if (inflight.has(url)) {
    return inflight.get(url);
  }
  
  // Make new request
  const promise = api
    .get(url)
    .then(response => {
      setInCache(cacheKey, response, ttl);
      inflight.delete(url);
      return response;
    })
    .catch(error => {
      inflight.delete(url);
      throw error;
    });
  
  inflight.set(url, promise);
  return promise;
}

export const toAbsoluteUploadUrl = (url = "") => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
  return `${UPLOADS_BASE_URL}${url}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  withCredentials: true, // Required for cross-origin cookie-based auth
});

// Apply retry middleware with exponential backoff
axiosRetry(api, RETRY_CONFIG);

const multipartConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

const isFormDataPayload = (payload) =>
  typeof FormData !== "undefined" && payload instanceof FormData;

const postWithOptionalMultipart = (url, payload) =>
  isFormDataPayload(payload) ? api.post(url, payload, multipartConfig) : api.post(url, payload);

const putWithOptionalMultipart = (url, payload) =>
  isFormDataPayload(payload) ? api.put(url, payload, multipartConfig) : api.put(url, payload);

api.interceptors.request.use((config) => {
  // Auth is cookie-based (HTTP-only admin_token set by server).
  // withCredentials: true on the axios instance handles this automatically.
  // We keep the Bearer header fallback for direct API tooling / non-browser clients.
  const token = document.cookie.match(/admin_token=([^;]+)/);
  config.headers = config.headers || {};
  return config;
});

// In production, suppress console noise from expected network failures
// (e.g. backend unreachable, CORS errors). Errors are still propagated
// to calling code for UI handling — we just avoid console spam.
const IS_PROD = import.meta.env.PROD;
if (IS_PROD) {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Only suppress network-level errors (no response), not API errors
      if (!error.response) {
        // Silently reject — component error handlers still fire
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );
}

export const parseApiError = (error) => {
  const status = error.response?.status;
  const data = error.response?.data;

  const formatDetail = (detail) => {
    if (!detail) return "";

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item && typeof item === "object") {
            const location = Array.isArray(item.loc)
              ? item.loc.filter((part) => typeof part === "string" || typeof part === "number").join(".")
              : "";
            const message = item.msg || item.message || item.detail || "Invalid value.";
            return location ? `${location}: ${message}` : message;
          }

          return String(item);
        })
        .filter(Boolean)
        .join("; ");
    }

    if (typeof detail === "object") {
      if (detail.msg || detail.loc || detail.message) {
        return formatDetail([detail]);
      }

      if (detail.detail) {
        return formatDetail(detail.detail);
      }

      if (detail.message) {
        return formatDetail(detail.message);
      }

      return JSON.stringify(detail);
    }

    return String(detail);
  };

  const detailMessage = formatDetail(data?.detail || data?.message || data?.error || data?.errors);

  if (status === 401) {
    return detailMessage || "You are not authorized. Please log in again.";
  }

  if (status === 403) {
    return detailMessage || "You do not have permission to perform this action.";
  }

  if (status === 404) {
    return detailMessage || "The requested item was not found.";
  }

  if (status === 422) {
    return detailMessage ? `Validation failed: ${detailMessage}` : "Validation failed.";
  }

  if (status && status >= 500) {
    return detailMessage || "Server error. Please try again later.";
  }

  if (detailMessage) {
    return detailMessage;
  }

  return error.message || "Unexpected error";
};

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// Public API with request deduplication & caching
export const publicApi = {
  // Paginated endpoints with optional parameters
  getMembers: (params = {}) => {
    const url = `/members?page=${params.page || 1}&limit=${params.limit || 20}`;
    return cachedGet(url, CACHE_TTL);
  },
  getGallery: (params = {}) => {
    const url = `/gallery?page=${params.page || 1}&limit=${params.limit || 12}`;
    return cachedGet(url, CACHE_TTL);
  },
  getActivities: (params = {}) => {
    const url = `/activities?page=${params.page || 1}&limit=${params.limit || 10}`;
    return cachedGet(url, CACHE_TTL);
  },
  getNewsletters: (params = {}) => {
    const url = `/newsletters?page=${params.page || 1}&limit=${params.limit || 15}`;
    return cachedGet(url, CACHE_TTL);
  },
  getDownloads: (params = {}) => {
    const url = `/downloads?page=${params.page || 1}&limit=${params.limit || 20}`;
    return cachedGet(url, CACHE_TTL);
  },
  getFacilities: () => cachedGet("/facilities", CACHE_TTL),
  submitContact: (payload) => api.post("/contact", payload),
  getActiveConference: () => cachedGet("/conferences/active", ACTIVE_CONFERENCE_CACHE_TTL),
  getConferences: (params = {}) => {
    const url = `/conferences/?page=${params.page || 1}&limit=${params.limit || 10}`;
    return cachedGet(url, CONFERENCE_CACHE_TTL);
  },
  
  // Force refresh (clear cache for specific endpoint)
  clearMemberCache: () => cache.delete(getCacheKey("/members")),
  clearConferenceCache: () => cache.delete(getCacheKey("/conferences/")),
  clearActiveConferenceCache: () => cache.delete(getCacheKey("/conferences/active")),
  clearAllCache: () => cache.clear(),
  // Conference Portal Generic Getters
  getConferencePortalResource: (resource, conferenceId) => {
    const url = `/conference-portal/${resource}?conference_id=${conferenceId}&limit=100`;
    return cachedGet(url, CONFERENCE_CACHE_TTL);
  },
  submitConferencePortal: (resource, payload) => postWithOptionalMultipart(`/public/conference-portal/${resource}`, payload),
  // Utility: clear the dismissed localStorage flag so the notification shows again
  clearNotificationDismissal: () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("conference_banner_dismissed"))
      .forEach((k) => localStorage.removeItem(k));
  },
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
  imageAudit: {
    list: () => api.get("/image-audit"),
    autoFix: (entity, id) => api.post(`/image-audit/auto-fix/${entity}/${id}`),
  },
  conferences: {
    list: () => api.get("/conferences/"),
    active: () => api.get("/conferences/active"),
    create: (payload) => postWithOptionalMultipart("/conferences", payload),
    update: (id, payload) => putWithOptionalMultipart(`/conferences/${id}`, payload),
    remove: (id) => api.delete(`/conferences/${id}`),
  },
  conferencePortal: {
    list: (resource, conferenceId) => api.get(`/conference-portal/${resource}?conference_id=${conferenceId}&limit=100`),
    create: (resource, payload) => postWithOptionalMultipart(`/conference-portal/${resource}`, payload),
    update: (resource, id, payload) => putWithOptionalMultipart(`/conference-portal/${resource}/${id}`, payload),
    remove: (resource, id) => api.delete(`/conference-portal/${resource}/${id}`),
  },
  users: {
    list: () => api.get("/admin/users"),
    create: (payload) => api.post("/admin/users", payload),
    update: (id, payload) => api.put(`/admin/users/${id}`, payload),
    remove: (id) => api.delete(`/admin/users/${id}`),
  },
  audit: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return api.get(`/admin/audit-logs?${qs}`);
    },
    loginHistory: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return api.get(`/admin/login-logs?${qs}`);
    },
  },
};

export default api;
