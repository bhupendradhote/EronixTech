// frontend/src/services/adminDashboardService.ts

import api from "./api";

// ==============================
// Interfaces (matching backend responses)
// ==============================

// --- Dashboard ---
export interface DashboardOverview {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCategories: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface SalesStats {
  period: "daily" | "weekly" | "monthly" | "yearly";
  data: SalesDataPoint[];
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface UserGrowthPoint {
  date: string;
  newUsers: number;
  activeUsers: number;
}

export interface UserStats {
  period: "daily" | "weekly" | "monthly";
  data: UserGrowthPoint[];
  totalUsers: number;
  activeUsers: number;
}

export interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface TopProduct {
  id: number;
  name: string;
  total_sold: number;
  revenue: number;
  stock: number;
}

// --- Brand ---
export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- Product ---
export interface ProductImage {
  image_path: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductOffer {
  offer_title: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'inactive' | 'expired';
}

export interface ProductVariant {
  sku: string;
  variant_name: string;
  ram?: string;
  storage?: string;
  color?: string;
  price: number;
  offer_price?: number;
  stock_quantity: number;
  status: 'active' | 'inactive';
}

export interface ProductSpecification {
  group_name: string;
  spec_name: string;
  spec_value: string;
  sort_order?: number;
}

export interface ImportResult {
  success: boolean;
  message: string;
  errors?: string[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  product_code?: string;
  sku?: string;
  barcode?: string;
  product_type: 'normal' | 'pc_build' | 'pc_pre_build';
  brand_id?: number;
  category_id?: number;
  sub_category_id?: number;
  build_pc_category_id?: number;
  build_pc_subcategory_id?: number;
  build_pc_sub_subcategory_id?: number;
  short_description?: string;
  description?: string;
  key_features?: string[];
  cost_price?: number;
  mrp: number;
  selling_price: number;
  offer_price?: number;
  stock_quantity: number;
  minimum_stock_alert: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'pre_order';
  status: 'active' | 'inactive' | 'draft' | 'archived';
  featured: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  images?: ProductImage[];
  offers?: ProductOffer[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  activeOnly?: boolean;
  categoryId?: number;
  status?: string;
}

// --- SubCategory ---
export interface SubCategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon_url?: string | null;
  is_active: boolean;
  display_order: number;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
}

// --- User ---
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

export interface UpdateProfileData {
  full_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  user?: T;
  data?: T;
}

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

// ==============================
// Unified Admin Service
// ==============================

const adminDashboardService = {
  // ---------- Dashboard ----------
  getOverview: async (): Promise<DashboardOverview> => {
    const response = await api.get<{ success: boolean; data: DashboardOverview }>(
      "/admin/dashboard/overview"
    );
    return response.data.data;
  },

  getSalesStats: async (
    period: "daily" | "weekly" | "monthly" | "yearly" = "monthly",
    startDate?: string,
    endDate?: string
  ): Promise<SalesStats> => {
    const params = new URLSearchParams();
    params.append("period", period);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const response = await api.get<{ success: boolean; data: SalesStats }>(
      `/admin/dashboard/sales?${params.toString()}`
    );
    return response.data.data;
  },

  getUserStats: async (
    period: "daily" | "weekly" | "monthly" = "monthly"
  ): Promise<UserStats> => {
    const params = new URLSearchParams();
    params.append("period", period);

    const response = await api.get<{ success: boolean; data: UserStats }>(
      `/admin/dashboard/users?${params.toString()}`
    );
    return response.data.data;
  },

  getRecentOrders: async (limit: number = 10): Promise<RecentOrder[]> => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());

    const response = await api.get<{ success: boolean; data: RecentOrder[] }>(
      `/admin/dashboard/recent-orders?${params.toString()}`
    );
    return response.data.data;
  },

  getTopProducts: async (limit: number = 5): Promise<TopProduct[]> => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());

    const response = await api.get<{ success: boolean; data: TopProduct[] }>(
      `/admin/dashboard/top-products?${params.toString()}`
    );
    return response.data.data;
  },

  // ---------- Brands ----------
  getAllBrands: async (activeOnly: boolean = false): Promise<Brand[]> => {
    const params = new URLSearchParams();
    if (activeOnly) params.append("active", "true");

    const response = await api.get<{ success: boolean; data: Brand[] }>(
      `/brands?${params.toString()}`
    );
    return response.data.data;
  },

  getBrandById: async (id: number): Promise<Brand> => {
    const response = await api.get<{ success: boolean; data: Brand }>(
      `/brands/${id}`
    );
    return response.data.data;
  },

  createBrand: async (data: FormData): Promise<Brand> => {
    const response = await api.post<{ success: boolean; data: Brand }>(
      "/brands",
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data;
  },

  updateBrand: async (id: number, data: FormData): Promise<Brand> => {
    const response = await api.put<{ success: boolean; data: Brand }>(
      `/brands/${id}`,
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data;
  },

  deleteBrand: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean }>(`/brands/${id}`);
  },

  // ---------- Products ----------
  getAllProducts: async (filters: ProductFilters = {}): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (filters.activeOnly) params.append("active", "true");
    if (filters.categoryId) params.append("category_id", filters.categoryId.toString());
    if (filters.status) params.append("status", filters.status);

    const response = await api.get<{ success: boolean; data: Product[] }>(
      `/products?${params.toString()}`
    );
    return response.data.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get<{ success: boolean; data: Product }>(
      `/products/${id}`
    );
    return response.data.data;
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get<{ success: boolean; data: Product }>(
      `/products/slug/${slug}`
    );
    return response.data.data;
  },

  createProduct: async (data: FormData): Promise<Product> => {
    const response = await api.post<{ success: boolean; data: Product }>(
      "/products",
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data;
  },

  updateProduct: async (id: number, data: FormData): Promise<Product> => {
    const response = await api.put<{ success: boolean; data: Product }>(
      `/products/${id}`,
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean }>(`/products/${id}`);
  },

  importProducts: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ImportResult>(
      "/products/import",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  // ---------- SubCategories ----------
  getSubCategoriesByCategory: async (
    categoryId: number,
    activeOnly: boolean = false
  ): Promise<SubCategory[]> => {
    const params = new URLSearchParams();
    if (activeOnly) params.append("active", "true");

    const response = await api.get<{ success: boolean; data: SubCategory[] }>(
      `/sub-categories/category/${categoryId}?${params.toString()}`
    );
    return response.data.data;
  },

  getSubCategoryById: async (id: number): Promise<SubCategory> => {
    const response = await api.get<{ success: boolean; data: SubCategory }>(
      `/sub-categories/${id}`
    );
    return response.data.data;
  },

  createSubCategory: async (data: FormData): Promise<SubCategory> => {
    const response = await api.post<{ success: boolean; data: SubCategory }>(
      "/sub-categories",
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data;
  },

  updateSubCategory: async (id: number, data: FormData): Promise<SubCategory> => {
    const response = await api.put<{ success: boolean; data: SubCategory }>(
      `/sub-categories/${id}`,
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data;
  },

  deleteSubCategory: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean }>(`/sub-categories/${id}`);
  },

  // ---------- Users (Admin) ----------
  getProfile: async (): Promise<ApiResponse<UserProfile> | UserProfile> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (
    userData: UpdateProfileData
  ): Promise<ApiResponse<UserProfile>> => {
    const response = await api.put<ApiResponse<UserProfile>>(
      '/users/profile',
      userData
    );
    return response.data;
  },

  changePassword: async (
    passwordData: ChangePasswordData
  ): Promise<ApiResponse<null>> => {
    const response = await api.put<ApiResponse<null>>(
      '/users/change-password',
      passwordData
    );
    return response.data;
  },

  getAllCustomers: async (): Promise<AdminCustomerView[]> => {
    const adminToken = localStorage.getItem('adminToken');
    const response = await api.get('/users/all', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    return response.data.data || response.data;
  },
};

export default adminDashboardService;