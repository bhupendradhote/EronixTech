import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import authService from "../services/authService";
import { AuthContext } from "./AuthContext";
import type {
  User,
  LoginCredentials,
  RegisterData,
} from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (error) {
          console.error("Failed to load profile", error);
          authService.logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
  };

  const register = async (userData: RegisterData) => {
    const data = await authService.register(userData);
    setUser(data.user);
  };

  // --- NEW: Google Login Logic ---
  const googleLogin = async (token: string) => {
    const data = await authService.googleLogin(token);
    setUser(data.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        loading, 
        login, 
        register, 
        googleLogin, // <-- Added to the provider value
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};