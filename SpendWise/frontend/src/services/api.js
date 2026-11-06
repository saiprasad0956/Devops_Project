import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = err.config?.url?.includes("/auth/login");
    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export function getError(err) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => `${(e.loc || []).slice(1).join(".")}: ${(e.msg || "").replace(/^Value error, /, "")}`)
      .join("; ");
  }
  if (err.code === "ERR_NETWORK") return "Cannot reach the server. Is the backend running on port 8000?";
  return err.message || "Something went wrong";
}

export default api;
