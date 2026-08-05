const express = require('express');
const router = express.Router();
const userAddressController = require('../controllers/userAddressController');

// Import both middlewares
const { protect } = require('../middleware/authMiddleware'); 
const { adminProtect } = require('../middleware/adminMiddleware'); 

// --- STANDARD USER ROUTES ---
router.post('/', protect, userAddressController.createAddress);
router.put('/:id', protect, userAddressController.updateAddress);
router.delete('/:id', protect, userAddressController.deleteAddress);

// FIX: Match the frontend route and inject the secure JWT user ID
router.get('/my-addresses', protect, (req, res, next) => {
    req.params.userId = req.user.id; 
    next();
}, userAddressController.getUserAddresses);


// --- ADMIN ROUTES ---
// Admin getting ANY user's addresses (uses req.params.userId)
router.get('/admin/user/:userId', adminProtect, userAddressController.getAddressesByUserIdAdmin);

module.exports = router;