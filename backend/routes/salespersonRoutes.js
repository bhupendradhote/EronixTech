const express = require('express');
const router = express.Router();
const {
    getActiveSalespersons,
    getAllSalespersons,
    getSalespersonById,
    createSalesperson,
    updateSalesperson,
    deleteSalesperson
} = require('../controllers/salespersonController');
const { protect } = require('../middleware/authMiddleware');

// ========== PUBLIC ==========
router.get('/active', protect, getActiveSalespersons); // If you want to protect, or make public

// ========== ADMIN ==========
router.get('/admin', protect, getAllSalespersons);
router.get('/admin/:id', protect, getSalespersonById);
router.post('/admin', protect, createSalesperson);
router.put('/admin/:id', protect, updateSalesperson);
router.delete('/admin/:id', protect, deleteSalesperson);

module.exports = router;