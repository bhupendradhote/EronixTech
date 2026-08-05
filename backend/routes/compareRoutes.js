const express = require('express');
const router = express.Router();
const compareController = require('../controllers/compareController');
const { protect } = require('../middleware/authMiddleware'); // use the existing auth middleware

// All routes require user authentication
router.use(protect);

router.get('/', compareController.getCompare);
router.post('/', compareController.addToCompare);
router.delete('/:productId', compareController.removeFromCompare);
router.delete('/', compareController.clearCompare);

module.exports = router;