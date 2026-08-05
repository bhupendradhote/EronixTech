import api from './api';

const shippingService = {
  checkDelivery: async (payload) => {
    const response = await api.post('/shipping/check-delivery', payload);
    return response.data;
  },
};

export default shippingService;
