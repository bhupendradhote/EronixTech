// frontend/src/services/preBookingService.ts

import api from "./api";

export type PreBookingStatus = "Pending" | "Contacted" | "Completed" | "Cancelled";

export interface PreBooking {
  id: number;
  product_id: number;
  variant_id?: number | null;
  product_name: string;
  variant_name?: string | null;
  name: string;
  email: string;
  phone: string;
  quantity: number;
  pincode?: string | null;
  message?: string | null;
  status: PreBookingStatus;
  created_at: string;
}

export interface CreatePreBookingPayload {
  productId: number;
  variantId?: number | null;
  productName: string;
  variantName?: string | null;
  name: string;
  email: string;
  phone: string;
  quantity: number;
  pincode?: string | null;
  message?: string | null;
}

const preBookingService = {
  // PUBLIC: Create a new pre-booking request
  createPreBooking: async (payload: CreatePreBookingPayload): Promise<PreBooking> => {
    const response = await api.post<{ success: boolean; message: string; data: PreBooking }>(
      "/prebookings",
      payload
    );
    return response.data.data;
  },

  // ADMIN ONLY: Get all pre-bookings
  getAllPreBookings: async (): Promise<PreBooking[]> => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin token not found");
    }
    const response = await api.get<{ success: boolean; data: PreBooking[] }>(
      "/prebookings",
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    return response.data.data;
  },

  // ADMIN ONLY: Get a single pre-booking
  getPreBookingById: async (id: number): Promise<PreBooking> => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin token not found");
    }
    const response = await api.get<{ success: boolean; data: PreBooking }>(
      `/prebookings/${id}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    return response.data.data;
  },

  // ADMIN ONLY: Update the status of a pre-booking
  updatePreBookingStatus: async (
    id: number,
    status: PreBookingStatus
  ): Promise<PreBooking> => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin token not found");
    }
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: PreBooking;
    }>(
      `/prebookings/${id}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    return response.data.data;
  },

  // ADMIN ONLY: Delete a pre-booking
  deletePreBooking: async (id: number): Promise<void> => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Admin token not found");
    }
    await api.delete<{ success: boolean }>(`/prebookings/${id}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
  },
};

export default preBookingService;