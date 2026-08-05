const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');

// Route to generate a Razorpay Order ID (Prepaid Flow Step 1)
router.post('/create-order', createOrder);

// Route to verify Razorpay signature and push to FShip (Prepaid Flow Step 2)
router.post('/verify', verifyPayment);

module.exports = router;