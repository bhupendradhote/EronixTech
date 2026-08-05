import api from "./api";

const buildPcItemService = {
  getAll: async () => {
    const response = await api.get("/build-pc-items");
    return response.data;
  },

  getById: async (id: number | string) => {
    const response = await api.get(`/build-pc-items/${id}`);
    return response.data;
  },

  create: async (data: unknown) => {
    const response = await api.post("/build-pc-items", data);
    return response.data;
  },

  update: async (id: number | string, data: unknown) => {
    const response = await api.put(`/build-pc-items/${id}`, data);
    return response.data;
  },

  delete: async (id: number | string) => {
    const response = await api.delete(`/build-pc-items/${id}`);
    return response.data;
  },
};

export default buildPcItemService;