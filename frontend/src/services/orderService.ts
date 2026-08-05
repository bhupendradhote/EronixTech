/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

const orderService = {
  createCodOrder: async (orderPayload: any) => {
    const response = await api.post('/orders/cod', orderPayload);
    return response.data;
  },

  createPendingOrder: async (orderPayload: any) => {
    const response = await api.post('/orders/prepaid', orderPayload);
    return response.data;
  },

  getUserOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  getOrderDetails: async (orderId: number) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  getAllOrders: async () => {
    const response = await api.get('/orders/admin/all');
    return response.data;
  },

  cancelOrder: async (orderId: number, reason?: string) => {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  updateOrderStatus: async (orderId: number, status: string) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  checkDelivery: async (payload: {
    pincode: string;
    weight?: number;
    length?: number;
    breadth?: number;
    height?: number;
  }) => {
    const response = await api.post('/orders/delivery/check', payload);
    return response.data;
  },

  createReturn: async (orderId: number) => {
    const response = await api.post(`/orders/${orderId}/return`);
    return response.data;
  },
};

export default orderService;