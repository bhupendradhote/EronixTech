const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/item/:cartItemId', cartController.updateQuantity);
router.delete('/item/:cartItemId', cartController.removeItem);
router.delete('/clear', cartController.clearCart);

// NEW warranty route
router.post('/warranty', cartController.addWarrantyToCart);

module.exports = router;