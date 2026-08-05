/* eslint-disable preserve-caught-error */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

// Types
export interface GameDevice {
  id?: number;
  name: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GameDeviceResponse {
  success: boolean;
  devices?: GameDevice[];
  device?: GameDevice;
  message?: string;
}

const gameDeviceService = {
  // Public
  getActiveDevices: async (): Promise<GameDeviceResponse> => {
    const response = await api.get<GameDeviceResponse>("/game-devices");
    return response.data;
  },

  // Admin
  getAllDevices: async (): Promise<GameDeviceResponse> => {
    const response = await api.get<GameDeviceResponse>("/game-devices/admin");
    return response.data;
  },

  getDeviceById: async (id: number): Promise<GameDeviceResponse> => {
    const response = await api.get<GameDeviceResponse>(`/game-devices/admin/${id}`);
    return response.data;
  },

  createDevice: async (data: Omit<GameDevice, 'id' | 'created_at' | 'updated_at'>): Promise<GameDeviceResponse> => {
    try {
      const response = await api.post<GameDeviceResponse>("/game-devices/admin", data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Create failed";
      throw new Error(message);
    }
  },

  updateDevice: async (id: number, data: Partial<GameDevice>): Promise<GameDeviceResponse> => {
    try {
      const response = await api.put<GameDeviceResponse>(`/game-devices/admin/${id}`, data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Update failed";
      throw new Error(message);
    }
  },

  deleteDevice: async (id: number): Promise<GameDeviceResponse> => {
    try {
      const response = await api.delete<GameDeviceResponse>(`/game-devices/admin/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Delete failed";
      throw new Error(message);
    }
  },
};

export default gameDeviceService;