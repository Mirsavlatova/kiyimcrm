import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── API FUNCTIONS ────────────────────────────────────────────────────────────

// Auth
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  getUsers: () => api.get("/auth/users"),
  createUser: (data) => api.post("/auth/users", data),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
};

// Dashboard
export const dashboardApi = {
  get: () => api.get("/dashboard"),
};

// Customers
export const customersApi = {
  list: (params) => api.get("/customers", { params }),
  get: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Products
export const productsApi = {
  list: (params) => api.get("/products", { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImage: (id, file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/products/${id}/upload-image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Categories
export const categoriesApi = {
  list: () => api.get("/categories"),
  create: (data) => api.post("/categories", data),
};

// Orders
export const ordersApi = {
  list: (params) => api.get("/orders", { params }),
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post("/orders", data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Payments
export const paymentsApi = {
  list: (params) => api.get("/payments", { params }),
  create: (data) => api.post("/payments", data),
};

// Warehouses
export const warehousesApi = {
  list: () => api.get("/warehouses"),
  create: (data) => api.post("/warehouses", data),
};

// Stock
export const stockApi = {
  list: (params) => api.get("/stock", { params }),
  create: (data) => api.post("/stock", data),
};

// Notifications
export const notificationsApi = {
  list: () => api.get("/notifications"),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};

// Audit logs
export const auditApi = {
  list: (params) => api.get("/audit-logs", { params }),
};

// Reports
export const reportsApi = {
  sales: (params) => api.get("/reports/sales", { params }),
};
