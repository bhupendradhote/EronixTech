const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// Import auth middleware (Make sure the path matches your structure)
const { protect } = require('../middleware/authMiddleware');

// Apply the protect middleware to all wishlist routes
// This guarantees req.user is populated for the controller
router.use(protect);

// Routes
router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router;