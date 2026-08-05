/* eslint-disable preserve-caught-error */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

// Types
export interface GameRate {
  id?: number;
  name: string;
  price: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GameRateResponse {
  success: boolean;
  rates?: GameRate[];
  rate?: GameRate;
  message?: string;
}

const gameRateService = {
  // Public
  getActiveRates: async (): Promise<GameRateResponse> => {
    const response = await api.get<GameRateResponse>("/game-rates");
    return response.data;
  },

  // Admin
  getAllRates: async (): Promise<GameRateResponse> => {
    const response = await api.get<GameRateResponse>("/game-rates/admin");
    return response.data;
  },

  getRateById: async (id: number): Promise<GameRateResponse> => {
    const response = await api.get<GameRateResponse>(`/game-rates/admin/${id}`);
    return response.data;
  },

  createRate: async (data: Omit<GameRate, 'id' | 'created_at' | 'updated_at'>): Promise<GameRateResponse> => {
    try {
      const response = await api.post<GameRateResponse>("/game-rates/admin", data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Create failed";
      throw new Error(message);
    }
  },

  updateRate: async (id: number, data: Partial<GameRate>): Promise<GameRateResponse> => {
    try {
      const response = await api.put<GameRateResponse>(`/game-rates/admin/${id}`, data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Update failed";
      throw new Error(message);
    }
  },

  deleteRate: async (id: number): Promise<GameRateResponse> => {
    try {
      const response = await api.delete<GameRateResponse>(`/game-rates/admin/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Delete failed";
      throw new Error(message);
    }
  },
};

export default gameRateService;