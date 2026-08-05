import api from "./api";

export interface Banner {
  id: number;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  banner_type: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const bannerService = {
  getAllBanners: async (activeOnly: boolean = false): Promise<Banner[]> => {
    const params = new URLSearchParams();
    if (activeOnly) params.append("active", "true");

    const response = await api.get<{ success: boolean; data: Banner[] }>(`/banners?${params.toString()}`);
    return response.data.data;
  },

  getBannerById: async (id: number): Promise<Banner> => {
    const response = await api.get<{ success: boolean; data: Banner }>(`/banners/${id}`);
    return response.data.data;
  },

  createBanner: async (data: FormData): Promise<Banner> => {
    const response = await api.post<{ success: boolean; data: Banner }>("/banners", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  updateBanner: async (id: number, data: FormData): Promise<Banner> => {
    const response = await api.put<{ success: boolean; data: Banner }>(`/banners/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  deleteBanner: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean }>(`/banners/${id}`);
  },
};

export default bannerService;