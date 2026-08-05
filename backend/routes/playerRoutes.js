const express = require('express');
const router = express.Router();
const {
    getPlayers,
    getPlayerById,
    updatePlayer,
    togglePlayerStatus
} = require('../controllers/playerController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', getPlayers);
router.get('/:id', getPlayerById);
router.put('/:id', updatePlayer);
router.patch('/:id/toggle', togglePlayerStatus);

module.exports = router;