import api from "./api";

export interface BuildPcSubCategory {
  id: number;
  build_pc_category_id: number;
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
}

const buildPcSubCategoryService = {
  // Fetches subcategories based on the parent Category ID
  getSubCategoriesByCategory: async (categoryId: number, activeOnly: boolean = false): Promise<BuildPcSubCategory[]> => {
    const params = new URLSearchParams();
    if (activeOnly) params.append("active", "true");

    const response = await api.get<{ success: boolean; data: BuildPcSubCategory[] }>(`/build-pc-subcategories/category/${categoryId}?${params.toString()}`);
    return response.data.data;
  },

  getSubCategoryById: async (id: number): Promise<BuildPcSubCategory> => {
    const response = await api.get<{ success: boolean; data: BuildPcSubCategory }>(`/build-pc-subcategories/${id}`);
    return response.data.data;
  },

  createSubCategory: async (data: FormData): Promise<BuildPcSubCategory> => {
    const response = await api.post<{ success: boolean; data: BuildPcSubCategory }>("/build-pc-subcategories", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  updateSubCategory: async (id: number, data: FormData): Promise<BuildPcSubCategory> => {
    const response = await api.put<{ success: boolean; data: BuildPcSubCategory }>(`/build-pc-subcategories/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  deleteSubCategory: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean }>(`/build-pc-subcategories/${id}`);
  },
};

export default buildPcSubCategoryService;