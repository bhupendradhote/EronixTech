import api from './api';

// ====================== Types ======================

/**
 * Unified user profile returned by the backend (after login or profile fetch)
 */
export interface UserProfile {
  id: number;
  full_name: string;       
  email: string;
  userType: 'admin' | 'salesperson';
  // Additional fields (may be present for salesperson)
  phone?: string | null;
  address?: string | null;
  profile_image?: string | null;
  is_active?: boolean;
  // Admin-specific
  role?: string;
}

/**
 * Login credentials
 */
export interface AdminLoginCredentials {
  email: string;
  password: string;
}

/**
 * Login API response
 */
export interface AdminAuthResponse {
  message: string;
  user: UserProfile;          // now returns 'user' instead of 'admin'
  token: string;
}

// ====================== Service ======================

const adminAuthService = {
  /**
   * Authenticate Admin or Salesperson
   */
  login: async (credentials: AdminLoginCredentials): Promise<AdminAuthResponse> => {
    const response = await api.post<AdminAuthResponse>('/admin/auth/login', credentials);

    if (response.data && response.data.token) {
      // Store token and user info
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
      localStorage.setItem('userType', response.data.user.userType);
    }

    return response.data;
  },

  /**
   * Log out the user (admin or salesperson)
   */
  logout: (): void => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userType');
    // Redirect to login page
    window.location.href = '/admin/login';
  },

  /**
   * Check if a user is currently authenticated (token exists)
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('adminToken');
  },

  /**
   * Get the stored user info (without making an API call)
   */
  getUserInfo: (): UserProfile | null => {
    const info = localStorage.getItem('userInfo');
    if (info) {
      try {
        return JSON.parse(info) as UserProfile;
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Fetch the logged-in user's profile (admin or salesperson)
   * The backend returns the appropriate profile based on token's userType
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/admin/auth/profile');
    return response.data;
  }
};

export default adminAuthService;