// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add the Frontend API Key for public routes
api.defaults.headers.common['x-app-client-key'] = import.meta.env.VITE_APP_CLIENT_KEY || 'your_secret_frontend_key_123';

// ==========================================
// CORRECTED Interceptor – reads adminToken
// ==========================================
api.interceptors.request.use(
  (config) => {
    // ONLY attach the token if an Authorization header HAS NOT been set manually
    if (!config.headers.Authorization) {
      // ✅ FIX: Read 'adminToken' instead of 'token'
      const token = localStorage.getItem("adminToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: response interceptor to handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';

      // ✅ Skip redirect for user authentication endpoints
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/google');

      if (!isAuthEndpoint) {
        // Only redirect for admin or other protected endpoints
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;