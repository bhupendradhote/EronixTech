const express = require('express');
const router = express.Router();
const {
    getActiveButtons,
    getAllButtons,
    getButtonById,
    createButton,
    updateButton,
    deleteButton
} = require('../controllers/quickButtonController');
const { protect } = require('../middleware/authMiddleware'); // adjust to your auth middleware

// ========== PUBLIC ROUTES ==========
router.get('/', getActiveButtons);

// ========== ADMIN ROUTES ==========
router.get('/admin', protect, getAllButtons);
router.get('/admin/:id', protect, getButtonById);
router.post('/admin', protect, createButton);
router.put('/admin/:id', protect, updateButton);
router.delete('/admin/:id', protect, deleteButton);

module.exports = router;