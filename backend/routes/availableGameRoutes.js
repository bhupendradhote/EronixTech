const express = require('express');
const router = express.Router();
const {
    getActiveGames,
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame
} = require('../controllers/availableGameController');
const { protect } = require('../middleware/authMiddleware'); // admin auth (if you have one)
// Or use your admin middleware – adjust import accordingly

// ========== PUBLIC ROUTES ==========
router.get('/', getActiveGames);

// ========== ADMIN ROUTES ==========
// All admin routes are protected – adjust middleware as per your setup
router.get('/admin', protect, getAllGames);           // GET all games (admin)
router.get('/admin/:id', protect, getGameById);       // GET single game
router.post('/admin', protect, createGame);           // POST create
router.put('/admin/:id', protect, updateGame);        // PUT update
router.delete('/admin/:id', protect, deleteGame);     // DELETE (soft delete)

module.exports = router;