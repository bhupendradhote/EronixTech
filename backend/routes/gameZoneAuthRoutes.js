const express = require('express');
const router = express.Router();
const {
    registerGameUser,
    loginGameUser,
    googleLoginGameUser,
    getGameUserProfile,
    updateGameUserProfile,   // new
    changeGameUserPassword   // new
} = require('../controllers/gameZoneAuthController');
const { protectGame } = require('../middleware/gameAuthMiddleware');

// Public routes
router.post('/register', registerGameUser);
router.post('/login', loginGameUser);
router.post('/google', googleLoginGameUser);

// Protected routes
router.get('/profile', protectGame, getGameUserProfile);
router.put('/profile', protectGame, updateGameUserProfile);
router.post('/change-password', protectGame, changeGameUserPassword);

module.exports = router;