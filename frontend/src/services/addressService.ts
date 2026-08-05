import api from "./api";

// 1. Interfaces
export interface Address {
  id: number;
  user_id: number;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressPayload {
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  address_type?: string;
  is_default_shipping?: boolean;
  is_default_billing?: boolean;
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>;

// 2. Service Methods
const addressService = {
  // Create a new address for the logged-in user
  createAddress: async (data: CreateAddressPayload): Promise<Address> => {
    const response = await api.post<{ success: boolean; data: Address }>(
      "/addresses",
      data
    );
    return response.data.data;
  },

  // Get addresses for the NORMAL logged-in user (My Profile page)
  getUserAddresses: async (): Promise<Address[]> => {
    // Note: Assuming your backend route for this is /addresses/my-addresses
    // The standard token is automatically attached by your api.ts interceptor
    const response = await api.get<{ success: boolean; data: Address[] }>(
      `/addresses/my-addresses`
    );
    return response.data.data;
  },

  // ADMIN ONLY: Get addresses for ANY user by their ID (Customers page)
  getAdminUserAddresses: async (userId: number): Promise<Address[]> => {
    const adminToken = localStorage.getItem("adminToken");
    
    // Force the admin token into the headers
    const config = adminToken
      ? { headers: { Authorization: `Bearer ${adminToken}` } }
      : {};

    const response = await api.get<{ success: boolean; data: Address[] }>(
      `/addresses/admin/user/${userId}`,
      config
    );
    return response.data.data;
  },

  // Update an existing address
  updateAddress: async (
    id: number,
    data: UpdateAddressPayload
  ): Promise<Address> => {
    const response = await api.put<{ success: boolean; data: Address }>(
      `/addresses/${id}`,
      data
    );
    return response.data.data;
  },

  // Delete an existing address
  deleteAddress: async (id: number): Promise<void> => {
    await api.delete<{ success: boolean }>(`/addresses/${id}`);
  },
};

export default addressService;