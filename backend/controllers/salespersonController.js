const Salesperson = require('../models/Salesperson');
const { body, validationResult } = require('express-validator'); // optional but recommended

// ========== PUBLIC (Active only) ==========
exports.getActiveSalespersons = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const salespersons = await Salesperson.getActive(tenantId);
        res.json({ success: true, salespersons });
    } catch (error) {
        console.error('Get Active Salespersons Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ========== ADMIN CRUD ==========
exports.getAllSalespersons = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const salespersons = await Salesperson.getAll(tenantId);
        res.json({ success: true, salespersons });
    } catch (error) {
        console.error('Get All Salespersons Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getSalespersonById = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const { id } = req.params;
        const salesperson = await Salesperson.findById(id, tenantId);
        if (!salesperson) {
            return res.status(404).json({ message: 'Salesperson not found' });
        }
        res.json({ success: true, salesperson });
    } catch (error) {
        console.error('Get Salesperson By ID Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createSalesperson = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const { name, email, phone, password, address, profile_image } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        // Basic email format check (optional)
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Password length check
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Optional: check if email already exists for this tenant (can be handled by DB unique constraint)
        // but we can catch the error later.

        const id = await Salesperson.create({
            tenantId,
            name,
            email,
            phone: phone || null,
            password,
            address: address || null,
            profile_image: profile_image || null
        });

        const newSalesperson = await Salesperson.findById(id, tenantId);
        res.status(201).json({
            success: true,
            message: 'Salesperson created successfully',
            salesperson: newSalesperson
        });
    } catch (error) {
        console.error('Create Salesperson Error:', error);
        // Handle duplicate email error (MySQL error code 1062)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already exists for this tenant' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateSalesperson = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const { id } = req.params;
        const { name, email, phone, password, address, profile_image, is_active } = req.body;

        const existing = await Salesperson.findById(id, tenantId);
        if (!existing) {
            return res.status(404).json({ message: 'Salesperson not found' });
        }

        // Build update data object (only provided fields)
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) {
            // Validate email format
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
            updateData.email = email;
        }
        if (phone !== undefined) updateData.phone = phone;
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters' });
            }
            updateData.password = password;
        }
        if (address !== undefined) updateData.address = address;
        if (profile_image !== undefined) updateData.profile_image = profile_image;
        if (is_active !== undefined) updateData.is_active = is_active;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const updated = await Salesperson.update(id, tenantId, updateData);
        if (updated === 0) {
            return res.status(400).json({ message: 'Update failed' });
        }

        const updatedSalesperson = await Salesperson.findById(id, tenantId);
        res.json({
            success: true,
            message: 'Salesperson updated successfully',
            salesperson: updatedSalesperson
        });
    } catch (error) {
        console.error('Update Salesperson Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already exists for this tenant' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteSalesperson = async (req, res) => {
    try {
        const tenantId = req.user?.tenant_id || 1;
        const { id } = req.params;

        const existing = await Salesperson.findById(id, tenantId);
        if (!existing) {
            return res.status(404).json({ message: 'Salesperson not found' });
        }

        const deleted = await Salesperson.delete(id, tenantId);
        if (deleted === 0) {
            return res.status(400).json({ message: 'Delete failed' });
        }

        res.json({
            success: true,
            message: 'Salesperson deactivated successfully'
        });
    } catch (error) {
        console.error('Delete Salesperson Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};