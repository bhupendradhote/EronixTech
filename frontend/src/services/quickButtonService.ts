/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

// ✅ Ensure this is exported
export interface QuickButtonData {
  id?: number;
  title: string;
  description?: string;
  type: string;
  price?: number;
  is_active?: boolean;
}

const quickButtonService = {
  // Public – get active quick buttons
  getActiveButtons: async () => {
    const response = await api.get("/quick-buttons");
    return response.data;
  },

  // Admin – get all quick buttons (including inactive)
  getAllButtons: async () => {
    const response = await api.get("/quick-buttons/admin");
    return response.data;
  },

  // Admin – get single button by ID
  getButtonById: async (id: number) => {
    const response = await api.get(`/quick-buttons/admin/${id}`);
    return response.data;
  },

  // Admin – create quick button
  createButton: async (buttonData: QuickButtonData) => {
    try {
      const response = await api.post("/quick-buttons/admin", buttonData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Create failed";
      throw new Error(message);
    }
  },

  // Admin – update quick button
  updateButton: async (id: number, buttonData: QuickButtonData) => {
    try {
      const response = await api.put(`/quick-buttons/admin/${id}`, buttonData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Update failed";
      throw new Error(message);
    }
  },

  // Admin – soft delete (deactivate)
  deleteButton: async (id: number) => {
    try {
      const response = await api.delete(`/quick-buttons/admin/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Delete failed";
      throw new Error(message);
    }
  },
};

export default quickButtonService;