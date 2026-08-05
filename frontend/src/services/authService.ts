import api from "./api";
// Use 'import type' to fix the verbatimModuleSyntax error
import type { LoginCredentials, RegisterData } from "../types/auth";

const setSession = (token: string | null) => {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
};

const authService = {
  register: async (userData: RegisterData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.token) {
      setSession(response.data.token);
    }
    return response.data;
  },

  login: async (credentials: LoginCredentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      setSession(response.data.token);
    }
    return response.data;
  },

  getProfile: async () => {
    const token = localStorage.getItem("token");
    if (token) setSession(token);
    
    const response = await api.get("/auth/profile");
    return response.data;
  },

  logout: () => {
    setSession(null);
  },

  // Add this inside the authService object
  googleLogin: async (token: string) => {
    const response = await api.post("/auth/google", { token });
    if (response.data.token) {
      setSession(response.data.token);
    }
    return response.data;
  },
};

export default authService;