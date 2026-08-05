const express = require('express');
const router = express.Router();
const {
    getActiveRates,
    getAllRates,
    getRateById,
    createRate,
    updateRate,
    deleteRate
} = require('../controllers/gameRateController');
const { protect } = require('../middleware/authMiddleware'); // your admin auth

// ========== PUBLIC ==========
router.get('/', getActiveRates);

// ========== ADMIN ==========
router.get('/admin', protect, getAllRates);
router.get('/admin/:id', protect, getRateById);
router.post('/admin', protect, createRate);
router.put('/admin/:id', protect, updateRate);
router.delete('/admin/:id', protect, deleteRate);

module.exports = router;