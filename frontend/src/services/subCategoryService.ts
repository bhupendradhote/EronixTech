import api from "./api";

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

const subCategoryService = {
  // Get sub-categories for a specific parent category
  getSubCategoriesByCategory: async (categoryId: number, activeOnly: boolean = false): Promise<SubCategory[]> => {
    const params = new URLSearchParams();
    if (activeOnly) params.append("active", "true");

    const response = await api.get<{ success: boolean; data: SubCategory[] }>(
      `/sub-categories/category/${categoryId}?${params.toString()}`
    );
    return response.data.data;
  },

  getSubCategoryById: async (id: number): Promise<SubCategory> => {
    const response = await api.get<{ success: boolean; data: SubCategory }>(`/sub-categories/${id}`);
    return response.data.data;
  },

  // UPDATED to accept FormData
  createSubCategory: async (data: FormData): Promise<SubCategory> => {
    const response = await api.post<{ success: boolean; data: SubCategory }>("/sub-categories", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  // UPDATED to accept FormData
  updateSubCategory: async (id: number, data: FormData): Promise<SubCategory> => {
    const response = await api.put<{ success: boolean; data: SubCategory }>(`/sub-categories/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  deleteSubCategory: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean }>(`/sub-categories/${id}`);
  },
};

export default subCategoryService;