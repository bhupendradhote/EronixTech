const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile } = require('../controllers/adminAuthController');
const { adminProtect } = require('../middleware/adminMiddleware');

// --- PUBLIC ADMIN ROUTES ---
router.post('/login', loginAdmin);

// --- SECURED ADMIN ROUTES ---
router.get('/profile', adminProtect, getAdminProfile);

module.exports = router;