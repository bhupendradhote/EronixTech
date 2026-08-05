import { createContext, useContext } from "react";

// 1. Define your TypeScript Interfaces
export interface User {
  id: number | string;
  full_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  is_active?: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  phone_number?: string;
  password?: string;
  date_of_birth?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
}

// 2. Export the Context object
export const AuthContext = createContext<AuthContextType | null>(null);

// 3. Export the custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};