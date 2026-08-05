const jwt = require('jsonwebtoken');
require('dotenv').config();

const adminProtect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if the token specifically belongs to an admin
            if (decoded.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
            }

            req.admin = decoded; // Attach admin payload to request
            return next(); // Successfully verified
        } catch (error) {
            console.error("Admin Token verification failed:", error.message);
            return res.status(401).json({ success: false, message: 'Not authorized as admin, token failed or expired' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
};

module.exports = { adminProtect };