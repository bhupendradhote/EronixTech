/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';

interface GetAvailabilityParams {
  date: string;
  platform: string;
  durationMinutes?: number;
}

interface CreateOnlineBookingPayload {
  platform: string;
  game_id?: number;
  rate_id?: number;
  preferred_device_id?: number;
  salesperson_id?: number;
  salesperson_name?: string;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  start_time: string;
  duration_minutes: number;
  subtotal?: number;
  discount_percent?: number;
  discount_amount?: number;
  tax_amount?: number;
  round_off?: number;
  total_price?: number;
  paid_amount?: number;
  due_amount?: number;
  addons_data?: any[];
  payment_status?: string;
  payment_mode?: string;
  notes?: string;
}

interface WalkInBookingPayload {
  device_id: number;
  game_id?: number;
  rate_id?: number;
  salesperson_id?: number;
  salesperson_name?: string;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  start_time?: string;
  duration_minutes: number;
  subtotal?: number;
  discount_percent?: number;
  discount_amount?: number;
  tax_amount?: number;
  round_off?: number;
  total_price?: number;
  paid_amount?: number;
  due_amount?: number;
  addons_data?: any[];
  payment_status?: string;
  payment_mode?: string;
  notes?: string;
}

type BookingStatus =
  | 'held'
  | 'confirmed'
  | 'playing'
  | 'completed'
  | 'cancelled'
  | 'no_show';

// Added Interfaces to fix TypeScript errors
interface AdminBookingsParams {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  booking_source?: string;
  search?: string;
}

interface AdminStatsParams {
  start_date?: string;
  end_date?: string;
}

interface PaymentPayload {
  amount: number;
  payment_mode: string;
}

const gameBookingService = {
  getAvailability: async ({
    date,
    platform,
    durationMinutes = 60,
  }: GetAvailabilityParams) => {
    const response = await api.get('/game-bookings/availability', {
      params: {
        date,
        platform,
        duration_minutes: durationMinutes,
        slot_interval: 30,
        open_time: '10:00',
        close_time: '23:00',
      },
    });

    return response.data;
  },

createOnlineBooking: async (payload: CreateOnlineBookingPayload) => {
  const token = localStorage.getItem('gameToken');
  const response = await api.post('/game-bookings', payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  return response.data;
},

  getTimeline: async (date: string) => {
    const response = await api.get('/game-bookings/admin/timeline', {
      params: { date },
    });

    return response.data;
  },

  getAlerts: async (minutes: number = 20) => {
    const response = await api.get('/game-bookings/admin/alerts', {
      params: { minutes },
    });

    return response.data;
  },

  createWalkIn: async (payload: WalkInBookingPayload) => {
    const response = await api.post('/game-bookings/admin/walk-in', payload);
    return response.data;
  },

  extend: async (id: number, extraMinutes: number = 30) => {
    const response = await api.patch(`/game-bookings/admin/${id}/extend`, {
      extra_minutes: extraMinutes,
    });
    return response.data;
  },

  updateStatus: async (id: number, status: BookingStatus) => {
    const response = await api.patch(`/game-bookings/admin/${id}/status`, {
      status,
    });
    return response.data;
  },

  // Added TypeScript definitions for the parameters
  getAdminBookings: async (params: AdminBookingsParams) => {
    const response = await api.get('/game-bookings/admin/list', { params });
    return response.data;
  },

  getAdminStats: async (params: AdminStatsParams) => {
    const response = await api.get('/game-bookings/admin/stats', { params });
    return response.data;
  },

  receivePayment: async (id: number, payload: PaymentPayload) => {
    const response = await api.post(`/game-bookings/admin/${id}/payment`, payload);
    return response.data;
  },
};

export default gameBookingService;