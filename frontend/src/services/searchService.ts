import api from "./api";
import type { Product } from './productService';

const searchService = {
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await api.get<{ success: boolean; data: Product[] }>(`/search`, {
      params: { q: query }
    });
    return response.data.data;
  },
};

export default searchService;