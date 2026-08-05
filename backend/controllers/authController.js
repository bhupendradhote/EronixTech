const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
require('dotenv').config();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    try {
        const { full_name, email, phone_number, password, date_of_birth } = req.body;

        // Validation
        if (!full_name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user already exists (Email or Phone)
        const userExists = await User.findByEmail(email);
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        if (phone_number) {
            const phoneExists = await User.findByPhone(phone_number);
            if (phoneExists) {
                return res.status(400).json({ message: 'User with this phone number already exists' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const userId = await User.create({
            full_name,
            email,
            phone_number,
            password_hash,
            date_of_birth
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: userId, full_name, email, phone_number },
            token: generateToken(userId)
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate a user (Login)
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({ message: 'Your account has been deactivated' });
        }

        // --- NEW SAFETY CHECK ---
        // If the user registered via Google, they won't have a password hash
        if (!user.password_hash) {
            return res.status(401).json({ 
                message: 'This account was created with Google. Please use Google Login.' 
            });
        }

        // Match password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    phone_number: user.phone_number
                },
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        // req.user.id comes from the auth middleware
        const user = await User.findById(req.user.id);

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// @desc    Authenticate user via Google
// @route   POST /api/auth/google
exports.googleLogin = async (req, res) => {
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

        let user = await User.findByEmail(email);

        if (!user) {
            // Create user with a NULL password hash
            const userId = await User.create({
                full_name: name,
                email: email,
                phone_number: null, 
                password_hash: null, // <--- Set to null
                date_of_birth: null
            });

            user = { id: userId, full_name: name, email, phone_number: null, is_active: true };
        }

        if (user.is_active === false) {
            return res.status(403).json({ message: 'Your account has been deactivated' });
        }

        res.json({
            message: 'Google Login successful',
            user: {
                id: user.id || user._id, 
                full_name: user.full_name,
                email: user.email,
                phone_number: user.phone_number
            },
            token: generateToken(user.id || user._id)
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ message: 'Invalid or expired Google token' });
    }
};