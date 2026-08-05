const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, googleLogin } = require('../controllers/authController');

// Import the middleware
const { protect } = require('../middleware/authMiddleware');

// --- PUBLIC ROUTES (No token required) ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);


// --- SECURED ROUTES (Token required) ---
// By adding 'protect' before 'getUserProfile', this route is now fully secured.
router.get('/profile', protect, getUserProfile);

module.exports = router;