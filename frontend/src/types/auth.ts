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