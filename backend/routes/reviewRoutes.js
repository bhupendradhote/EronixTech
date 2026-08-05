const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Import Middlewares
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Optional: Import admin middleware if you have one for the status update endpoint
// const { adminAuth } = require('../middleware/authMiddleware');

// ----------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------
// Get all approved reviews for a specific product
router.get('/product/:productId', reviewController.getProductReviews);

// ----------------------------------------------------
// PROTECTED USER ROUTES
// ----------------------------------------------------
router.use(protect);

// Create a review (Allows up to 5 images per review)
router.post('/', upload.array('images', 5), reviewController.addReview);

// Delete user's own review
router.delete('/:id', reviewController.deleteReview);

// ----------------------------------------------------
// ADMIN ROUTES
// ----------------------------------------------------

// Add this line to get ALL reviews for the admin dashboard
router.get('/admin/all', reviewController.getAllAdminReviews);

router.put('/:id/status', reviewController.updateReviewStatus);

module.exports = router;