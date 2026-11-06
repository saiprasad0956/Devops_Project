import api from "./api";

// Remove empty filters so the API doesn't receive "" for dates/ids
const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined));

export const authService = {
  register: (d) => api.post("/auth/register", d).then((r) => r.data),
  login: (d) => api.post("/auth/login", d).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  updateProfile: (d) => api.put("/auth/me", d).then((r) => r.data),
  changePassword: (d) => api.post("/auth/change-password", d).then((r) => r.data),
};

export const transactionService = {
  list: (params) => api.get("/transactions", { params: clean(params) }).then((r) => r.data),
  create: (d) => api.post("/transactions", d).then((r) => r.data),
  update: (id, d) => api.put(`/transactions/${id}`, d).then((r) => r.data),
  remove: (id) => api.delete(`/transactions/${id}`),
};

export const categoryService = {
  list: () => api.get("/categories").then((r) => r.data),
};

export const budgetService = {
  list: (params) => api.get("/budgets", { params: clean(params) }).then((r) => r.data),
  create: (d) => api.post("/budgets", d).then((r) => r.data),
  update: (id, d) => api.put(`/budgets/${id}`, d).then((r) => r.data),
  remove: (id) => api.delete(`/budgets/${id}`),
};

export const analyticsService = {
  dashboard: () => api.get("/analytics/dashboard").then((r) => r.data),
  monthly: (months = 6) => api.get("/analytics/monthly", { params: { months } }).then((r) => r.data),
  categories: (params) => api.get("/analytics/categories", { params: clean(params) }).then((r) => r.data),
};

export const reportService = {
  exportCsv: (params) =>
    api.get("/reports/export", { params: clean(params), responseType: "blob" }).then((r) => r.data),
};
