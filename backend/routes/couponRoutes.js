const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

// Import your API Key middleware
const protectRoute = require('../middleware/apiAuth'); 

// ==========================================
// ALL ROUTES PROTECTED BY API KEY
// ==========================================

// User Route
router.post('/apply', protectRoute, couponController.applyCoupon);

// Get Routes
router.get('/', protectRoute, couponController.getAllCoupons);
router.get('/:id', protectRoute, couponController.getCouponById);

// Create, Update, Delete Routes (Now using protectRoute)
router.post('/', protectRoute, express.json(), couponController.createCoupon);
router.put('/:id', protectRoute, express.json(), couponController.updateCoupon);
router.delete('/:id', protectRoute, couponController.deleteCoupon);

module.exports = router;