import api from "./api";

export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_amount: number;
  min_purchase_amount: number;
  max_discount_amount?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  usage_limit?: number | null;
  used_count: number;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ApplyCouponResponse {
  success: boolean;
  message: string;
  data: {
    coupon: string;
    discount_type: 'percentage' | 'fixed';
    original_total: number;
    discount_amount: number;
    final_total: number;
  };
}

const couponService = {
  // Get all coupons (Admins)
  getAllCoupons: async (status?: string): Promise<Coupon[]> => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);

    const response = await api.get<{ success: boolean; data: Coupon[] }>(
      `/coupons?${params.toString()}`
    );
    return response.data.data;
  },

  getCouponById: async (id: number): Promise<Coupon> => {
    const response = await api.get<{ success: boolean; data: Coupon }>(`/coupons/${id}`);
    return response.data.data;
  },

  // Note: Coupons use standard JSON, not FormData, as there are no image uploads
  createCoupon: async (data: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.post<{ success: boolean; data: Coupon }>("/coupons", data);
    return response.data.data;
  },

  updateCoupon: async (id: number, data: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.put<{ success: boolean; data: Coupon }>(`/coupons/${id}`, data);
    return response.data.data;
  },

  deleteCoupon: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean }>(`/coupons/${id}`);
  },

// Apply a coupon during checkout (Strictly Typed)
  applyCoupon: async (data: { code: string; cart_total: number }): Promise<ApplyCouponResponse> => {
    const response = await api.post<ApplyCouponResponse>("/coupons/apply", data);
    return response.data;
  },
};

export default couponService;