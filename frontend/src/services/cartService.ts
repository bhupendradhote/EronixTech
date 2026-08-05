/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";
import type { Product } from './productService';

// ------------------------------------------------------------------
// TypeScript Interfaces
// ------------------------------------------------------------------

// A CartItem extends a Product because the backend JOINs the products table,
// returning all product details alongside the specific cart entry data.
export interface CartItem extends Product {
  cart_item_id: number;
  quantity: number;
  unit_price: number;   // price per unit for this cart item
  total_price: number;  // unit_price * quantity
  is_warranty?: boolean;        // true if this item is an extended warranty
  warranty_name?: string;       // name of the warranty plan (if is_warranty)
}

export interface CartData {
  cart_id: number;
  total_amount: number;
  items: CartItem[];
}

export interface CartResponse {
  success: boolean;
  message?: string;
  data: CartData;
}

export interface CartActionResponse {
  success: boolean;
  message: string;
}

// ------------------------------------------------------------------
// Cart Service API Methods
// ------------------------------------------------------------------
const cartService = {
  /**
   * Get the current user's active cart.
   * Uses the JWT token automatically via the 'api' interceptor.
   */
  getCart: async (): Promise<CartData> => {
    const response = await api.get<CartResponse>("/cart");
    return response.data.data;
  },

  /**
   * Add a product to the cart (or increment its quantity if it exists).
   * @param productId  The ID of the product to add.
   * @param quantity   The amount to add (defaults to 1).
   * @param variantId  Optional variant ID (if the product has variants).
   */
  // src/services/cartService.ts
addToCart: async (
  productId: number,
  quantity: number = 1,
  variantId: number | null = null
): Promise<CartActionResponse> => {
  const payload: any = { product_id: productId, quantity };
  if (variantId !== null) {
    payload.variant_id = variantId;
  }
  const response = await api.post<CartActionResponse>("/cart", payload);
  window.dispatchEvent(new Event('cartUpdated'));
  return response.data;
},

  /**
   * Add an extended warranty as a separate cart item.
   * @param productId     The ID of the parent product.
   * @param variantId     Optional variant ID.
   * @param warrantyName  Name of the warranty plan.
   * @param warrantyPrice Price of the warranty.
   * @param quantity      Usually 1 (warranty is a single item).
   */
addWarrantyToCart: async (
  productId: number,
  variantId: number | null,
  warrantyName: string,
  warrantyPrice: number,
  quantity: number = 1
): Promise<CartActionResponse> => {
  const response = await api.post<CartActionResponse>("/cart/warranty", {
    product_id: productId,
    variant_id: variantId,
    warranty_name: warrantyName,
    warranty_price: warrantyPrice,
    quantity,
  });
  window.dispatchEvent(new Event('cartUpdated'));
  return response.data;
},

  /**
   * Update the exact quantity of an existing cart item.
   * @param cartItemId  The specific ID of the item *in the cart* (not the product ID).
   * @param quantity    The new absolute quantity.
   */
  updateQuantity: async (
    cartItemId: number,
    quantity: number
  ): Promise<CartActionResponse> => {
    const response = await api.put<CartActionResponse>(`/cart/item/${cartItemId}`, {
      quantity: quantity,
    });
    window.dispatchEvent(new Event('cartUpdated'));
    return response.data;
  },

  /**
   * Remove a specific item from the cart entirely.
   * @param cartItemId  The specific ID of the item *in the cart*.
   */
  removeItem: async (cartItemId: number): Promise<CartActionResponse> => {
    const response = await api.delete<CartActionResponse>(`/cart/item/${cartItemId}`);
    window.dispatchEvent(new Event('cartUpdated'));
    return response.data;
  },

  /**
   * Clear all items from the user's cart.
   */
  clearCart: async (): Promise<CartActionResponse> => {
    const response = await api.delete<CartActionResponse>("/cart/clear");
    window.dispatchEvent(new Event('cartUpdated'));
    return response.data;
  },
};

export default cartService;