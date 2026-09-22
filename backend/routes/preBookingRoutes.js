const express = require('express');
const router = express.Router();
const preBookingController = require('../controllers/preBookingController');

const protectRoute = require('../middleware/apiAuth');

// ==========================================
// ALL ROUTES PROTECTED BY API KEY
// ==========================================

// Public (frontend) – create a pre-booking
router.post('/', protectRoute, preBookingController.createPreBooking);

// Admin routes
router.get('/', protectRoute, preBookingController.getAllPreBookings);
router.get('/:id', protectRoute, preBookingController.getPreBookingById);

// Update status
router.patch('/:id/status', protectRoute, preBookingController.updatePreBookingStatus);

// Delete
router.delete('/:id', protectRoute, preBookingController.deletePreBooking);

module.exports = router;