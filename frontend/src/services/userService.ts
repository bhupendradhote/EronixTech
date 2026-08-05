import api from './api';

// 1. Define the shape of your User Profile
export interface UserProfile {
  id?: number;
  full_name: string;
  email: string;
  phone_number?: string | null;
  date_of_birth?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// 2. Define the shape of the data used for updating the profile
export interface UpdateProfileData {
  full_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
}

// 3. Define the shape of the data used for changing the password
export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

// 4. Define the standard API response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  user?: T;
  data?: T;
}

// Admin interfaces
export interface AdminCustomerView {
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  date_of_birth: string | null;
  is_active: boolean | number;
  created_at: string;
  address_id?: number | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

const userService = {
  /**
   * Fetch the logged-in user's profile
   */
  getProfile: async (): Promise<ApiResponse<UserProfile> | UserProfile> => {
    // The interceptor in api.ts automatically attaches the Bearer token
    const response = await api.get('/users/profile');
    return response.data;
  },

  /**
   * Update the user's profile details
   */
  updateProfile: async (userData: UpdateProfileData): Promise<ApiResponse<UserProfile>> => {
    // We pass the typed userData, and expect a typed ApiResponse back
    const response = await api.put<ApiResponse<UserProfile>>('/users/profile', userData);
    return response.data;
  },

  /**
   * Change the user's password
   */
  changePassword: async (passwordData: ChangePasswordData): Promise<ApiResponse<null>> => {
    const response = await api.put<ApiResponse<null>>('/users/change-password', passwordData);
    return response.data;
  },

/**
   * ADMIN ONLY: Fetch all users with their default addresses
   */
  getAllCustomers: async (): Promise<AdminCustomerView[]> => {
    // Explicitly grab the admin token to prevent 401 Unauthorized errors
    const adminToken = localStorage.getItem('adminToken');
    
    const response = await api.get('/users/all', {
      headers: {
        Authorization: `Bearer ${adminToken}` // Force the admin token
      }
    });
    
    // Check if your backend w  raps the array in a 'data' property (e.g., { success: true, data: [...] })
    return response.data.data || response.data; 
  },
};

export default userService;