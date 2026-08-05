import api from './api';

export interface RazorpayVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  internal_order_id: string | number; // Added to map payment to your DB and trigger FShip
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

const paymentService = {
  createRazorpayOrder: async (amount: number): Promise<RazorpayOrderResponse> => {
    const response = await api.post<RazorpayOrderResponse>('/payment/create-order', { amount });
    return response.data;
  },

  verifyRazorpayPayment: async (paymentData: RazorpayVerificationData): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/payment/verify', paymentData);
    return response.data;
  }
};

export default paymentService;