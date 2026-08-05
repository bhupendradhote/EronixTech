const GameUser = require('../models/GameUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
require('dotenv').config();

// Generate JWT token for game user
const generateGameToken = (id) => {
    return jwt.sign(
        { id, user_type: 'game' },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '30d' }
    );
};

// Helper: Generate a unique username from email or name
const generateUsername = async (email, name) => {
    let base = email.split('@')[0]; // use email prefix
    // Clean up: remove special chars, keep alphanumeric and underscore
    base = base.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    // If base is empty, use 'user'
    if (!base) base = 'user';

    let username = base;
    let counter = 1;
    while (await GameUser.findByUsername(username)) {
        username = `${base}${counter}`;
        counter++;
    }
    return username;
};

// @desc    Register a new game user (email/password)
// @route   POST /api/game/auth/register
exports.registerGameUser = async (req, res) => {
    try {
        const { username, email, full_name, phone_number, password } = req.body;

        if (!username || !email || !full_name || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const existingUser = await GameUser.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const existingUsername = await GameUser.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const userId = await GameUser.create({
            username,
            email,
            full_name,
            password_hash,
            phone_number
        });

        const token = generateGameToken(userId);

        res.status(201).json({
            message: 'Game user registered successfully',
            user: { id: userId, username, email, full_name, phone_number },
            token
        });

    } catch (error) {
        console.error('Game Register Error:', error);
        res.status(500).json({ message: 'Server error during game registration' });
    }
};

// @desc    Authenticate a game user (email/password)
// @route   POST /api/game/auth/login
exports.loginGameUser = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Please provide identifier and password' });
        }

        let user = await GameUser.findByEmail(identifier);
        if (!user) {
            user = await GameUser.findByUsername(identifier);
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Your account has been deactivated' });
        }

        if (!user.password_hash) {
            return res.status(401).json({
                message: 'This account was created via Google. Please use Google Login.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        await GameUser.updateLastLogin(user.id);

        const token = generateGameToken(user.id);

        res.json({
            message: 'Game login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                phone_number: user.phone_number,
                coins: user.coins,
                level: user.level
            },
            token
        });

    } catch (error) {
        console.error('Game Login Error:', error);
        res.status(500).json({ message: 'Server error during game login' });
    }
};

// @desc    Google Login for game users
// @route   POST /api/game/auth/google
exports.googleLoginGameUser = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Google token is required' });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        // Check if a game user exists with this email
        let user = await GameUser.findByEmail(email);

        if (!user) {
            // Create a new game user via Google
            // Generate a unique username
            const username = await generateUsername(email, name);

            const userId = await GameUser.create({
                username,
                email,
                full_name: name,
                password_hash: null, // no password for Google users
                phone_number: null
            });

            user = { id: userId, username, email, full_name: name, phone_number: null, is_active: true, coins: 0, level: 1 };
        }

        // Check if account is active
        if (!user.is_active) {
            return res.status(403).json({ message: 'Your account has been deactivated' });
        }

        // Update last login
        await GameUser.updateLastLogin(user.id);

        const jwtToken = generateGameToken(user.id);

        res.json({
            message: 'Google Login successful for game user',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                phone_number: user.phone_number,
                coins: user.coins || 0,
                level: user.level || 1
            },
            token: jwtToken
        });

    } catch (error) {
        console.error('Game Google Auth Error:', error);
        res.status(401).json({ message: 'Invalid or expired Google token' });
    }
};

// @desc    Get logged-in game user profile (protected)
// @route   GET /api/game/auth/profile
exports.getGameUserProfile = async (req, res) => {
    try {
        const user = await GameUser.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Game user not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Game Profile Error:', error);
        res.status(500).json({ message: 'Server error fetching game profile' });
    }
};

// @desc    Update game user profile
// @route   PUT /api/game/auth/profile
// @access  Private
exports.updateGameUserProfile = async (req, res) => {
    try {
        const { full_name, phone_number } = req.body;
        const userId = req.user.id;

        // Validate
        if (!full_name) {
            return res.status(400).json({ message: 'Full name is required' });
        }

        const affectedRows = await GameUser.updateProfile(userId, { full_name, phone_number });
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch updated user
        const updatedUser = await GameUser.findById(userId);
        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// @desc    Change game user password
// @route   POST /api/game/auth/change-password
// @access  Private
exports.changeGameUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Get user with password hash
        const user = await GameUser.getPasswordHashById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has a password (Google users may have null)
        if (!user.password_hash) {
            return res.status(400).json({ message: 'This account uses Google login. No password to change.' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        const affectedRows = await GameUser.updatePassword(userId, newPasswordHash);
        if (affectedRows === 0) {
            return res.status(500).json({ message: 'Failed to update password' });
        }

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: 'Server error changing password' });
    }
};