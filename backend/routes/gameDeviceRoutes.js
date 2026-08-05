const express = require('express');
const router = express.Router();
const {
    getActiveDevices,
    getAllDevices,
    getDeviceById,
    createDevice,
    updateDevice,
    deleteDevice
} = require('../controllers/gameDeviceController');
const { protect } = require('../middleware/authMiddleware');

// ========== PUBLIC ==========
router.get('/', getActiveDevices);

// ========== ADMIN ==========
router.get('/admin', protect, getAllDevices);
router.get('/admin/:id', protect, getDeviceById);
router.post('/admin', protect, createDevice);
router.put('/admin/:id', protect, updateDevice);
router.delete('/admin/:id', protect, deleteDevice);

module.exports = router;