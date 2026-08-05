const express = require('express');
const router = express.Router();
const { 
    getProfile, 
    updateProfile, 
    changePassword, 
    getAllUsersWithAddresses 
} = require('../controllers/userController');

// Import both middlewares
const { protect } = require('../middleware/authMiddleware'); 
const { adminProtect } = require('../middleware/adminMiddleware'); 

// --- STANDARD USER ROUTES ---
// Regular users can access and modify their own profiles
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// --- ADMIN ROUTES ---
// Only Admins should be able to pull a list of all users and their addresses
router.get('/all', adminProtect, getAllUsersWithAddresses);

module.exports = router;