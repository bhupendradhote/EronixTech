// middleware/apiAuth.js

const protectRoute = (req, res, next) => {
    // This is the secret key your frontend will send
    const clientKey = req.headers['x-app-client-key'];
    
    // You can store this in your .env file as APP_CLIENT_KEY
    // If it's not in .env, it defaults to 'your_secret_frontend_key_123'
    const validKey = process.env.APP_CLIENT_KEY || 'your_secret_frontend_key_123';

    if (!clientKey || clientKey !== validKey) {
        return res.status(403).json({
            success: false,
            message: "Direct browser access is not allowed."
        });
    }

    next(); // Key matches, allow the request to proceed
};

module.exports = protectRoute;