const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warrantyController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, warrantyController.addWarranty);

module.exports = router;