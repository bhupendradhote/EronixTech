const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAvailability,
  createOnlineBooking,
  getAdminTimeline,
  createWalkInBooking,
  extendBooking,
  updateBookingStatus,
  getAlerts,
  getAdminBookingsList,
  getAdminBookingsStats,
  receivePayment
} = require('../controllers/gameBookingController');

// Customer-facing availability. No login needed to browse slots.
router.get('/availability', getAvailability);

// Customer booking. Uses existing bearer token middleware.
router.post('/', protect, createOnlineBooking);

// Admin/POS actions.
router.get('/admin/timeline', protect, getAdminTimeline);
router.get('/admin/alerts', protect, getAlerts);
router.post('/admin/walk-in', protect, createWalkInBooking);
router.patch('/admin/:id/extend', protect, extendBooking);
router.patch('/admin/:id/status', protect, updateBookingStatus);

// NEW ENDPOINTS ADDED FOR ADMIN DASHBOARD & PAYMENTS
router.get('/admin/list', protect, getAdminBookingsList);
router.get('/admin/stats', protect, getAdminBookingsStats);
router.post('/admin/:id/payment', protect, receivePayment);

module.exports = router;