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
// Request Interceptor – reads adminToken or gameToken
// ==========================================
api.interceptors.request.use(
  (config) => {
    // ONLY attach the token if an Authorization header HAS NOT been set manually
    if (!config.headers.Authorization) {
      // Check if we are on the game portal, check for gameToken first, else adminToken
      const token = localStorage.getItem("gameToken") || localStorage.getItem("adminToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// Response Interceptor
// ==========================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';

      // Skip redirect for user/auth endpoints
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/google');

      if (!isAuthEndpoint) {
        // Check if the user is currently on the public customer/gaming side
        const isCustomerPortal = 
          window.location.pathname.includes('/gaming-zone') ||
          window.location.pathname.includes('/tournament') ||
          window.location.pathname.includes('/game-store') ||
          window.location.pathname.includes('/game-contact');

        if (isCustomerPortal) {
          // Trigger the game login popup instead of redirecting to admin
          window.dispatchEvent(new Event('open-game-login'));
        } else {
          // Only force redirect to admin login if they are inside the admin area
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
          if (!window.location.pathname.includes('/admin/login')) {
            window.location.href = '/admin/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;