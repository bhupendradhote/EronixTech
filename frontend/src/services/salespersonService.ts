/* eslint-disable preserve-caught-error */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

// ========== Types ==========

/**
 * Salesperson data model (as returned by the API – password is excluded)
 */
export interface Salesperson {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    profile_image?: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    tenant_id?: number;
}

/**
 * Data required to create a new salesperson
 */
export interface CreateSalespersonData {
    name: string;
    email: string;
    phone?: string | null;
    password: string; // required for creation
    address?: string | null;
    profile_image?: string | null;
}

/**
 * Data for updating a salesperson – all fields optional, password only if changing
 */
export interface UpdateSalespersonData {
    name?: string;
    email?: string;
    phone?: string | null;
    password?: string; // only send if changing
    address?: string | null;
    profile_image?: string | null;
    is_active?: boolean;
}

/**
 * API response for salesperson operations
 */
export interface SalespersonResponse {
    success: boolean;
    message?: string;
    salesperson?: Salesperson;
    salespersons?: Salesperson[];
}

// ========== Service ==========

const salespersonService = {
    /**
     * Get active salespersons (for dropdowns)
     */
    getActive: async (): Promise<SalespersonResponse> => {
        const res = await api.get('/salespersons/active');
        return res.data;
    },

    /**
     * Get all salespersons (admin)
     */
    getAll: async (): Promise<SalespersonResponse> => {
        const res = await api.get('/salespersons/admin');
        return res.data;
    },

    /**
     * Get a single salesperson by ID
     */
    getById: async (id: number): Promise<SalespersonResponse> => {
        const res = await api.get(`/salespersons/admin/${id}`);
        return res.data;
    },

    /**
     * Create a new salesperson
     */
    create: async (data: CreateSalespersonData): Promise<SalespersonResponse> => {
        try {
            const res = await api.post('/salespersons/admin', data);
            return res.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Create failed';
            throw new Error(message);
        }
    },

    /**
     * Update a salesperson
     */
    update: async (id: number, data: UpdateSalespersonData): Promise<SalespersonResponse> => {
        try {
            const res = await api.put(`/salespersons/admin/${id}`, data);
            return res.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Update failed';
            throw new Error(message);
        }
    },

    /**
     * Soft delete a salesperson (set is_active = 0)
     */
    delete: async (id: number): Promise<SalespersonResponse> => {
        try {
            const res = await api.delete(`/salespersons/admin/${id}`);
            return res.data;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Delete failed';
            throw new Error(message);
        }
    },
};

export default salespersonService;