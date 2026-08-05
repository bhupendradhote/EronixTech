import api from "./api";

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

const brandService = {
  // Get all brands, optionally filtering for active only
  getAllBrands: async (activeOnly: boolean = false): Promise<Brand[]> => {
    const params = new URLSearchParams();
    if (activeOnly) params.append("active", "true");

    const response = await api.get<{ success: boolean; data: Brand[] }>(`/brands?${params.toString()}`);
    return response.data.data;
  },

  getBrandById: async (id: number): Promise<Brand> => {
    const response = await api.get<{ success: boolean; data: Brand }>(`/brands/${id}`);
    return response.data.data;
  },

  // UPDATED to accept FormData
  createBrand: async (data: FormData): Promise<Brand> => {
    const response = await api.post<{ success: boolean; data: Brand }>("/brands", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  // UPDATED to accept FormData
  updateBrand: async (id: number, data: FormData): Promise<Brand> => {
    const response = await api.put<{ success: boolean; data: Brand }>(`/brands/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  deleteBrand: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean }>(`/brands/${id}`);
  },
};

export default brandService;