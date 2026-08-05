/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

// ========== Type Definitions ==========

export interface Customer {
  id: number;
  name: string;
  mobile?: string;
  email?: string;
  username?: string;
}

export interface Salesperson {
  id: number;
  name: string;
}

export interface QuickButton {
  id: number;
  name: string;
  type: string;
  price: number;
  description?: string;
}

export interface SaleItem {
  product_id?: number | null;
  is_virtual?: boolean;
  name: string;
  hsn_code?: string;
  size?: string;
  color?: string;
  unit?: string;
  mrp?: number;
  price: number;
  gst?: number;
  discount?: number;
  qty: number;
  tax_amount?: number;
  total?: number;
}

export interface InvoiceData {
  customer_id?: number | null;
  customer_name?: string;
  customer_mobile?: string;
  salesperson_id?: number | null;
  salesperson_name?: string;
  items: SaleItem[];
  discount_percent?: number;
  subtotal?: number;
  tax_amount?: number;
  round_off?: number;
  total_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  payment_mode?: string;
  notes?: string;
  terms?: string;
}

export interface HeldBill {
  id: number;
  label: string;
  created_at: string;
  bill_data: string;
}

// ========== API Response Interfaces ==========

interface BaseResponse {
  success: boolean;
  message?: string;
}

interface CustomersResponse extends BaseResponse {
  customers: Customer[];
}

interface SalespersonsResponse extends BaseResponse {
  salespersons: Salesperson[];
}

interface QuickButtonsResponse extends BaseResponse {
  buttons: QuickButton[];
}

interface InvoiceResponse extends BaseResponse {
  invoiceNo: string;
  saleId: number;
}

interface HeldBillsResponse extends BaseResponse {
  bills: HeldBill[];
}

interface HoldBillResponse extends BaseResponse {
  message: string;
}

interface RecallBillResponse extends BaseResponse {
  data: string;
}

interface AddCustomerResponse extends BaseResponse {
  customer: Customer;
}

// ========== Service ==========

const posService = {
  /**
   * Get all customers from game_users table
   */
  getCustomers: async (): Promise<CustomersResponse> => {
    const res = await api.get('/pos/customers');
    return res.data;
  },

  /**
   * Add a new customer to game_users table
   */
  addCustomer: async (data: {
    full_name: string;
    phone_number?: string;
    email?: string;
    username?: string;
  }): Promise<AddCustomerResponse> => {
    const res = await api.post('/pos/customers', data);
    return res.data;
  },

  /**
   * Get all active salespersons
   */
  getSalespersons: async (): Promise<SalespersonsResponse> => {
    const res = await api.get('/pos/salespersons');
    return res.data;
  },

  /**
   * Get all active quick buttons (products for POS)
   */
  getQuickButtons: async (): Promise<QuickButtonsResponse> => {
    const res = await api.get('/pos/quick-buttons');
    return res.data;
  },

  /**
   * Save invoice with all items and payment details
   */
  saveInvoice: async (data: InvoiceData): Promise<InvoiceResponse> => {
    const res = await api.post('/pos/invoices', data);
    return res.data;
  },

  /**
   * Get all held bills for the current tenant
   */
  getHeldBills: async (): Promise<HeldBillsResponse> => {
    const res = await api.get('/pos/held-bills');
    return res.data;
  },

  /**
   * Hold a bill (save cart state for later recall)
   */
  holdBill: async (label: string, billData: unknown): Promise<HoldBillResponse> => {
    const res = await api.post('/pos/held-bills', {
      label,
      bill_data: JSON.stringify(billData),
    });
    return res.data;
  },

  /**
   * Recall a held bill by ID (deletes it after recall)
   */
  recallBill: async (id: number): Promise<RecallBillResponse> => {
    const res = await api.delete(`/pos/held-bills/${id}`);
    return res.data;
  },

  // Add to posService object
getSales: async (filters = {}) => {
    const res = await api.get('/pos/sales', { params: filters });
    return res.data;
},
};

export default posService;