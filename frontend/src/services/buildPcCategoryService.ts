import api from "./api";
import type { BuildPcSubCategory } from "./buildPcSubCategoryService";

export interface BuildPcCategory {
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
  sub_categories?: BuildPcSubCategory[]; 
}

const buildPcCategoryService = {
  getAllCategories: async (activeOnly: boolean = false, includeSubs: boolean = false): Promise<BuildPcCategory[]> => {
    const params = new URLSearchParams();
    if (activeOnly) params.append("active", "true");
    if (includeSubs) params.append("include_subs", "true");

    // Make sure your backend route is registered as /build-pc-categories in app.js
    const response = await api.get<{ success: boolean; data: BuildPcCategory[] }>(`/build-pc-categories?${params.toString()}`);
    return response.data.data;
  },

  getCategoryById: async (id: number): Promise<BuildPcCategory> => {
    const response = await api.get<{ success: boolean; data: BuildPcCategory }>(`/build-pc-categories/${id}`);
    return response.data.data;
  },

  createCategory: async (data: FormData): Promise<BuildPcCategory> => {
    const response = await api.post<{ success: boolean; data: BuildPcCategory }>("/build-pc-categories", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  updateCategory: async (id: number, data: FormData): Promise<BuildPcCategory> => {
    const response = await api.put<{ success: boolean; data: BuildPcCategory }>(`/build-pc-categories/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean }>(`/build-pc-categories/${id}`);
  },
};

export default buildPcCategoryService;