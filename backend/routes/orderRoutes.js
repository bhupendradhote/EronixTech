const express = require('express');
const router = express.Router();

// ---------- Middleware imports ----------
const protectRoute = require('../middleware/apiAuth');
const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminMiddleware');

// ---------- Controller imports ----------
const {
  createCodOrder,
  createPendingOrder,
  getUserOrders,
  getOrderDetails,
  getAllOrders,
  cancelOrder,
  checkDelivery,
  updateOrderStatus,
  createReturn
} = require('../controllers/orderController');



// ----- Delivery check (API key + JWT) -----
router.post('/delivery/check', protectRoute, protect, checkDelivery);

// ----- Order creation -----
router.post('/cod', protectRoute, protect, createCodOrder);
router.post('/prepaid', protectRoute, protect, createPendingOrder);

// ----- User orders -----
router.get('/my-orders', protectRoute, protect, getUserOrders);

// ----- Admin only -----
router.get('/admin/all', protectRoute, protect, adminProtect, getAllOrders);

// ----- Cancel order -----
router.post('/:id/cancel', protectRoute, protect, cancelOrder);

router.put('/:id/status', protectRoute, protect, adminProtect, updateOrderStatus);

// ----- Order details (must be last) -----
router.get('/:id', protectRoute, protect, getOrderDetails);

router.post('/:id/return', protectRoute, protect, adminProtect, createReturn);

module.exports = router;