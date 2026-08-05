// frontend/src/services/categoryService.ts

import api from "./api";
import type { SubCategory } from "./subCategoryService";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon_url?: string | null;
  banner_url?: string | null;
  is_active: boolean;
  display_order: number;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
  sub_categories?: SubCategory[];
}

const categoryService = {
  // Get all categories (normal user token)
  getAllCategories: async (activeOnly: boolean = false, includeSubs: boolean = false): Promise<Category[]> => {
    const params = new URLSearchParams();
    if (activeOnly) params.append("active", "true");
    if (includeSubs) params.append("include_subs", "true");
    const response = await api.get<{ success: boolean; data: Category[] }>(`/categories?${params.toString()}`);
    return response.data.data;
  },

  // ADMIN ONLY: Get all categories with admin token
  getAllCategoriesAdmin: async (activeOnly: boolean = false, includeSubs: boolean = false): Promise<Category[]> => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin token not found");
    }
    const params = new URLSearchParams();
    if (activeOnly) params.append("active", "true");
    if (includeSubs) params.append("include_subs", "true");

    const response = await api.get<{ success: boolean; data: Category[] }>(
      `/categories?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    return response.data.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await api.get<{ success: boolean; data: Category }>(`/categories/${id}`);
    return response.data.data;
  },

  createCategory: async (data: FormData): Promise<Category> => {
    const response = await api.post<{ success: boolean; data: Category }>("/categories", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  updateCategory: async (id: number, data: FormData): Promise<Category> => {
    const response = await api.put<{ success: boolean; data: Category }>(`/categories/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean }>(`/categories/${id}`);
  },
};

export default categoryService;