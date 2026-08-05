/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

// ========== Type Definitions ==========

export interface SaleItem {
    id?: number;
    product_id?: number;
    product_name: string;
    hsn_code?: string;
    size?: string;
    color?: string;
    qty: number;
    unit?: string;
    mrp?: number;
    unit_price: number;
    discount_percent?: number;
    tax_percent?: number;
    tax_amount?: number;
    total: number;
}

export interface Sale {
    id: number;
    invoice_no: string;
    sale_date: string;
    customer_id?: number | null;
    customer_name?: string;
    customer_mobile?: string;
    salesperson_id?: number | null;
    salesperson_name?: string;
    subtotal: number;
    discount_percent: number;
    discount_amount: number;
    tax_amount: number;
    round_off: number;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    payment_mode: string;
    status: string;
    notes?: string;
    terms?: string;
    created_at: string;
    item_count?: number;
    items?: SaleItem[];
}

export interface SalesFilters {
    start_date?: string;
    end_date?: string;
    customer_id?: string | number;
    salesperson_id?: string | number;
    payment_mode?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface SalesListResponse {
    success: boolean;
    data: Sale[];
    pagination: PaginationInfo;
}

export interface SalesStatsResponse {
    success: boolean;
    stats: {
        total_orders: number;
        total_revenue: number;
        total_paid: number;
        total_due: number;
        unique_customers: number;
        active_salespersons: number;
    };
}

export interface SaleResponse {
    success: boolean;
    sale: Sale & { items: SaleItem[] };
}

export interface PaymentResponse {
    success: boolean;
    message: string;
    newPaid: number;
    newDue: number;
    newStatus: string;
}

// ========== Service ==========

const salesService = {
    /**
     * Get sales list with filters and pagination
     */
    getSalesList: async (params: SalesFilters = {}): Promise<SalesListResponse> => {
        const res = await api.get('/pos/sales/list', { params });
        return res.data;
    },

    /**
     * Get single sale by ID with all items
     */
    getSaleById: async (id: number): Promise<SaleResponse> => {
        const res = await api.get(`/pos/sales/${id}`);
        return res.data;
    },

    /**
     * Get sales statistics
     */
    getSalesStats: async (params: {
        start_date?: string;
        end_date?: string;
    } = {}): Promise<SalesStatsResponse> => {
        const res = await api.get('/pos/sales/stats', { params });
        return res.data;
    },

    /**
     * Print invoice (generate PDF)
     */
    printInvoice: async (id: number): Promise<Blob> => {
        const res = await api.get(`/pos/sales/${id}/print`, {
            responseType: 'blob',
        });
        return res.data;
    },

    /**
     * Receive payment for a sale
     */
   // In salesService.ts, add this method:
receivePayment: async (id: number, data: { amount: number; payment_mode: string }) => {
    const res = await api.post(`/pos/sales/${id}/payment`, data);
    return res.data;
},
};

export default salesService;