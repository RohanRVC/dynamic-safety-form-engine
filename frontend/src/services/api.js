import axios from "axios";

/**
 * Base URL for API requests.
 * - Local dev: unset VITE_API_URL → "/api" (Vite proxies to backend).
 * - Production: MUST set VITE_API_URL to your backend origin, e.g. https://your-api.onrender.com
 *   (no trailing slash; paths are /metadata/..., /forms/...)
 */
export const API_BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
      const hint =
        API_BASE === "/api"
          ? " Using /api only works with Vite dev server proxy. For production set VITE_API_URL to your backend URL."
          : "";
      return Promise.reject(
        new Error(`Cannot reach API at ${API_BASE}.${hint}`)
      );
    }
    const message =
      err.response?.data?.detail?.validation_errors?.join(", ") ||
      err.response?.data?.detail ||
      err.message;
    return Promise.reject(new Error(message));
  }
);

export const branchApi = {
  list: () => api.get("/metadata/branches").then((r) => r.data),
  create: (data) => api.post("/metadata/branches", data).then((r) => r.data),
  delete: (id) => api.delete(`/metadata/branches/${id}`),
};

export const formApi = {
  list: () => api.get("/forms/definitions").then((r) => r.data),
  get: (id) => api.get(`/forms/definitions/${id}`).then((r) => r.data),
  create: (data) => api.post("/forms/definitions", data).then((r) => r.data),
  update: (id, data) => api.put(`/forms/definitions/${id}`, data).then((r) => r.data),
  duplicate: (id) =>
    api.post(`/forms/definitions/${id}/duplicate`).then((r) => r.data),
  delete: (id) => api.delete(`/forms/definitions/${id}`),
};

export const submissionApi = {
  submit: (formId, data) =>
    api.post(`/forms/${formId}/submission`, data).then((r) => r.data),
  listByForm: (formId, page = 1, pageSize = 20) =>
    api
      .get(`/forms/${formId}/submissions`, { params: { page, page_size: pageSize } })
      .then((r) => r.data),
  listAll: (page = 1, pageSize = 20) =>
    api
      .get("/forms/submissions/all", { params: { page, page_size: pageSize } })
      .then((r) => r.data),
};

export default api;
