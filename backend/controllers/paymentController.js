const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');
const { fulfillOrder } = require('./orderController');
require('dotenv').config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order (Prepaid Flow Step 1)
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send('Some error occurred');
    }

    return res.json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);

    return res.status(500).json({
      message: 'Error creating order',
      error: error.message,
    });
  }
};

// Verify Payment & Push to Shiprocket (Prepaid Flow Step 2)
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      internal_order_id,
    } = req.body;

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        message: 'Invalid signature sent!',
      });
    }

    // 1. Update payment status
    await db.query(
      `UPDATE orders
       SET
         payment_status = 'paid',
         razorpay_payment_id = ?,
         razorpay_signature = ?
       WHERE id = ?`,
      [
        razorpay_payment_id,
        razorpay_signature,
        internal_order_id,
      ]
    );

    // 2. Push the paid order to Shiprocket
    try {
      await fulfillOrder(internal_order_id, 'prepaid');
    } catch (shiprocketError) {
      console.error(
        'Payment verified, but Shiprocket failed:',
        shiprocketError.message
      );

      return res.status(200).json({
        message:
          'Payment successful, but Shiprocket sync failed. Our team will process the shipment manually.',
        logisticsSyncFailed: true,
      });
    }

    return res.status(200).json({
      message:
        'Payment verified and Shiprocket shipment created successfully',
      logisticsSyncFailed: false,
    });
  } catch (error) {
    console.error('Verification Error:', error);

    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};