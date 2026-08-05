const jwt = require('jsonwebtoken');
const GameUser = require('../models/GameUser');

const protectGame = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

        // Ensure this token is meant for game users
        if (decoded.user_type !== 'game') {
            return res.status(401).json({ message: 'Invalid token type for game access' });
        }

        const user = await GameUser.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Game Auth Middleware Error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

module.exports = { protectGame };