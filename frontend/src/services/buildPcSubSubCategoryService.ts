import api from "./api";

export interface BuildPcSubSubCategory {
  id: number;
  build_pc_subcategory_id: number;
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

const buildPcSubSubCategoryService = {
  getSubSubCategoriesBySubCategory: async (subCategoryId: number, activeOnly: boolean = false): Promise<BuildPcSubSubCategory[]> => {
    const params = new URLSearchParams();
    if (activeOnly) params.append("active", "true");

    const response = await api.get<{ success: boolean; data: BuildPcSubSubCategory[] }>(`/build-pc-sub-subcategories/subcategory/${subCategoryId}?${params.toString()}`);
    return response.data.data;
  },

  getById: async (id: number): Promise<BuildPcSubSubCategory> => {
    const response = await api.get<{ success: boolean; data: BuildPcSubSubCategory }>(`/build-pc-sub-subcategories/${id}`);
    return response.data.data;
  },

  create: async (data: FormData): Promise<BuildPcSubSubCategory> => {
    const response = await api.post<{ success: boolean; data: BuildPcSubSubCategory }>("/build-pc-sub-subcategories", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  update: async (id: number, data: FormData): Promise<BuildPcSubSubCategory> => {
    const response = await api.put<{ success: boolean; data: BuildPcSubSubCategory }>(`/build-pc-sub-subcategories/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean }>(`/build-pc-sub-subcategories/${id}`);
  },
};

export default buildPcSubSubCategoryService;