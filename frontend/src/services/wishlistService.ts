import api from "./api";
import type { Product } from './productService';

// ------------------------------------------------------------------
// TypeScript Interfaces
// ------------------------------------------------------------------

// Since your backend joins the products table, a wishlist item 
// contains all Product fields plus the wishlist metadata.
export interface WishlistItem extends Product {
  wishlist_entry_id: number;
  wishlisted_at: string;
}

export interface WishlistAddResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    customer_id: number;
    product_id: number;
  };
}

export interface WishlistRemoveResponse {
  success: boolean;
  message: string;
}

// ------------------------------------------------------------------
// Wishlist Service API Methods
// ------------------------------------------------------------------
const wishlistService = {
  /**
   * 1. Get the current user's wishlist
   * Uses the JWT token automatically via the 'api' interceptor
   */
  getWishlist: async (): Promise<WishlistItem[]> => {
    // Note: Adjust the '/wishlist' base route if you mounted it differently in server.js (e.g., '/api/wishlists')
    const response = await api.get<{ success: boolean; data: WishlistItem[] }>("/wishlist");
    return response.data.data;
  },

  /**
   * 2. Add a product to the wishlist
   * @param productId The ID of the product to add
   */
  addToWishlist: async (productId: number): Promise<WishlistAddResponse> => {
    const response = await api.post<WishlistAddResponse>("/wishlist", {
      product_id: productId,
    });
    // Trigger live header update
    window.dispatchEvent(new Event('wishlistUpdated'));
    return response.data;
  },

  /**
   * 3. Remove a product from the wishlist
   * @param productId The ID of the product to remove
   */
  removeFromWishlist: async (productId: number): Promise<WishlistRemoveResponse> => {
    const response = await api.delete<WishlistRemoveResponse>(`/wishlist/${productId}`);
    // Trigger live header update
    window.dispatchEvent(new Event('wishlistUpdated'));
    return response.data;
  },
};

export default wishlistService;