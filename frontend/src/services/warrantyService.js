import api from './api'; // your axios instance

const warrantyService = {
  /**
   * Add an extended warranty purchase for the authenticated user.
   * @param {Object} data
   * @param {number} data.productId
   * @param {number} data.variantId (optional)
   * @param {string} data.warrantyName
   * @param {number} data.warrantyPrice
   * @param {number} data.totalPrice (if you need to store the total paid with warranty)
   */
  addWarranty: async (data) => {
    const response = await api.post('/warranty/add', data);
    return response.data;
  },
};

export default warrantyService;