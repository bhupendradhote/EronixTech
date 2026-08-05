const Admin = require('../models/Admin');
const Salesperson = require('../models/Salesperson');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate token with role and userType
const generateAdminToken = (id, userType) => {
    return jwt.sign(
        { id, role: 'admin', userType },   // userType: 'admin' or 'salesperson'
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '7d' }
    );
};

// @desc    Authenticate Admin or Salesperson (Login)
// @route   POST /api/admin/auth/login
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        let user = null;
        let userType = null;
        let passwordHash = null;

        // 1. Check admins table
        const admin = await Admin.findByEmail(email);
        if (admin) {
            user = admin;
            userType = 'admin';
            passwordHash = admin.password_hash;
        } else {
            // 2. Check salespersons table (tenant_id = 1 as default)
            const salesperson = await Salesperson.findByEmail(email, 1);
            if (salesperson) {
                user = salesperson;
                userType = 'salesperson';
                passwordHash = salesperson.password;
            }
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Build response data (exclude password)
        const userData = {
            id: user.id,
            full_name: user.full_name || user.name,  // admins have full_name, salespersons have name
            email: user.email,
            userType,
        };

        res.json({
            message: 'Login successful',
            user: userData,
            token: generateAdminToken(user.id, userType)
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get logged in user profile (Admin or Salesperson)
// @route   GET /api/admin/auth/profile
// @access  Private (Admin only)
exports.getAdminProfile = async (req, res) => {
    try {
        const { id, userType } = req.admin; // from token payload

        let userProfile = null;
        if (userType === 'admin') {
            const admin = await Admin.findById(id);
            if (admin) {
                userProfile = {
                    id: admin.id,
                    full_name: admin.full_name,
                    email: admin.email,
                    role: admin.role,
                    userType: 'admin'
                };
            }
        } else if (userType === 'salesperson') {
            // Assume tenant_id = 1 for all salespersons (adjust as needed)
            const salesperson = await Salesperson.findById(id, 1);
            if (salesperson) {
                userProfile = {
                    id: salesperson.id,
                    full_name: salesperson.name,
                    email: salesperson.email,
                    phone: salesperson.phone,
                    address: salesperson.address,
                    profile_image: salesperson.profile_image,
                    is_active: salesperson.is_active,
                    userType: 'salesperson'
                };
            }
        }

        if (userProfile) {
            res.json(userProfile);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};