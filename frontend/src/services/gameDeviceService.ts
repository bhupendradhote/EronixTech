import api from "./api";

export interface Device {
  id: number;
  name: string;
  is_active?: boolean;
  platform?: string;
  created_at?: string;
  updated_at?: string;
}

const gameDeviceService = {
  /**
   * Get all active devices (public)
   * GET /api/game-devices
   * Returns an array of devices (id, name)
   */
  getActiveDevices: async (): Promise<Device[]> => {
    try {
      const response = await api.get("/game-devices");
      // Backend returns { success: true, devices: [...] }
      const devices = response.data.devices || [];
      // console.log("📡 [gameDeviceService] Raw response:", response.data);
      // console.log("📱 [gameDeviceService] Devices array:", devices);
      return devices;
    } catch (error) {
      console.error("❌ Error fetching active devices:", error);
      return [];
    }
  },

  /**
   * Get all devices (admin only)
   * GET /api/game-devices/admin
   * Returns an object with a `devices` array (full details including is_active)
   */
  getAllDevices: async (): Promise<{ devices: Device[] }> => {
    const response = await api.get("/game-devices/admin");
    return { devices: response.data.devices || [] };
  },

  /**
   * Create a new device (admin only)
   * POST /api/game-devices/admin
   */
  createDevice: async (data: { name: string; is_active?: boolean }): Promise<Device> => {
    const response = await api.post("/game-devices/admin", { name: data.name });
    return response.data.device;
  },

  /**
   * Update a device (admin only)
   * PUT /api/game-devices/admin/:id
   */
  updateDevice: async (id: number, data: Partial<Device>): Promise<Device> => {
    const response = await api.put(`/game-devices/admin/${id}`, data);
    return response.data.device;
  },

  /**
   * Soft delete a device (admin only)
   * DELETE /api/game-devices/admin/:id
   */
  deleteDevice: async (id: number): Promise<void> => {
    await api.delete(`/game-devices/admin/${id}`);
  },

  /**
   * Alias for getActiveDevices – kept for compatibility
   */
  getDevices: async (): Promise<Device[]> => {
    return gameDeviceService.getActiveDevices();
  },
};

export default gameDeviceService;