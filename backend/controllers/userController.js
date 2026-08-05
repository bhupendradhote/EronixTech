const User = require('../models/User'); 
const bcrypt = require('bcrypt');

// ==========================================
// 1. GET PROFILE
// ==========================================
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id; 

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. User ID missing." });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ success: false, message: "An internal server error occurred." });
    }
};

// ==========================================
// 2. UPDATE PROFILE
// ==========================================
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { full_name, email, phone_number, date_of_birth } = req.body;

        if (!full_name || !email) {
            return res.status(400).json({ success: false, message: "Full name and email are required." });
        }

        const existingEmailUser = await User.findByEmail(email);
        if (existingEmailUser && existingEmailUser.id !== userId) {
            return res.status(409).json({ success: false, message: "This email is already in use by another account." });
        }

        if (phone_number) {
            const existingPhoneUser = await User.findByPhone(phone_number);
            if (existingPhoneUser && existingPhoneUser.id !== userId) {
                return res.status(409).json({ success: false, message: "This phone number is already in use by another account." });
            }
        }

        const rowsUpdated = await User.update(userId, { full_name, email, phone_number, date_of_birth });

        if (rowsUpdated === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const updatedUser = await User.findById(userId);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "An internal server error occurred while updating the profile." });
    }
};

// ==========================================
// 3. CHANGE PASSWORD
// ==========================================
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { current_password, new_password } = req.body;

        // 1. New password is ALWAYS required
        if (!new_password) {
            return res.status(400).json({ success: false, message: "New password is required." });
        }

        const userDbData = await User.getPasswordHashById(userId);
        if (!userDbData) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // 2. Check if a password exists in the DB
        const hasExistingPassword = !!userDbData.password_hash;

        // 3. ONLY require current_password if they already have one
        if (hasExistingPassword) {
            if (!current_password) {
                return res.status(400).json({ success: false, message: "Current password is required." });
            }
            
            const isMatch = await bcrypt.compare(current_password, userDbData.password_hash);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Incorrect current password." });
            }
        }

        // 4. Update the password
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(new_password, salt);
        await User.updatePassword(userId, newPasswordHash);

        res.status(200).json({ success: true, message: "Password updated successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// ==========================================
// 4. GET ALL USERS (ADMIN ROUTE)
// ==========================================
const getAllUsersWithAddresses = async (req, res) => {
    try {
        const rawData = await User.getAllUsersWithAddresses();

        const usersMap = new Map();

        rawData.forEach(row => {
            if (!usersMap.has(row.user_id)) {
                usersMap.set(row.user_id, {
                    id: row.user_id,
                    full_name: row.full_name,
                    email: row.email,
                    phone_number: row.phone_number,
                    date_of_birth: row.date_of_birth,
                    is_active: row.is_active,
                    created_at: row.created_at,
                    addresses: []
                });
            }

            if (row.address_id) {
                usersMap.get(row.user_id).addresses.push({
                    id: row.address_id,
                    address_line_1: row.address_line_1,
                    address_line_2: row.address_line_2,
                    city: row.city,
                    state: row.state,
                    postal_code: row.postal_code,
                    country: row.country,
                    address_type: row.address_type,
                    is_default_shipping: !!row.is_default_shipping, // Convert 1/0 to true/false
                    is_default_billing: !!row.is_default_billing
                });
            }
        });

        const allUsers = Array.from(usersMap.values());

        res.status(200).json({
            success: true,
            count: allUsers.length,
            data: allUsers
        });

    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ success: false, message: "An internal server error occurred." });
    }
};

// Export the functions at the bottom
module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getAllUsersWithAddresses 
};