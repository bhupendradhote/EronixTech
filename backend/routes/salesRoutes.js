const express = require('express');
const router = express.Router();
const {
    getSalesList,
    getSaleById,
    getSalesStats
} = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', getSalesList);
router.get('/stats', getSalesStats);
router.get('/:id', getSaleById);

module.exports = router;