const QuickButton = require('../models/QuickButton');

// ========== PUBLIC ==========
// @desc    Get all active quick buttons
// @route   GET /api/quick-buttons
exports.getActiveButtons = async (req, res) => {
    try {
        const buttons = await QuickButton.getActiveButtons();
        res.json({ success: true, buttons });
    } catch (error) {
        console.error('Get Active Quick Buttons Error:', error);
        res.status(500).json({ message: 'Server error fetching quick buttons' });
    }
};

// ========== ADMIN CRUD ==========
// @desc    Get all quick buttons (including inactive)
// @route   GET /api/admin/quick-buttons
// @access  Admin
exports.getAllButtons = async (req, res) => {
    try {
        const buttons = await QuickButton.getAllButtons();
        res.json({ success: true, buttons });
    } catch (error) {
        console.error('Get All Quick Buttons Error:', error);
        res.status(500).json({ message: 'Server error fetching quick buttons' });
    }
};

// @desc    Get single quick button by ID
// @route   GET /api/admin/quick-buttons/:id
// @access  Admin
exports.getButtonById = async (req, res) => {
    try {
        const button = await QuickButton.findById(req.params.id);
        if (!button) {
            return res.status(404).json({ message: 'Quick button not found' });
        }
        res.json({ success: true, button });
    } catch (error) {
        console.error('Get Quick Button By ID Error:', error);
        res.status(500).json({ message: 'Server error fetching quick button' });
    }
};

// @desc    Create a new quick button
// @route   POST /api/admin/quick-buttons
// @access  Admin
exports.createButton = async (req, res) => {
    try {
        const { title, description, type, price } = req.body;

        if (!title || !type) {
            return res.status(400).json({ message: 'Title and type are required' });
        }

        const buttonId = await QuickButton.create({
            title,
            description,
            type,
            price
        });

        const newButton = await QuickButton.findById(buttonId);
        res.status(201).json({
            success: true,
            message: 'Quick button created successfully',
            button: newButton
        });
    } catch (error) {
        console.error('Create Quick Button Error:', error);
        res.status(500).json({ message: 'Server error creating quick button' });
    }
};

// @desc    Update an existing quick button
// @route   PUT /api/admin/quick-buttons/:id
// @access  Admin
exports.updateButton = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, type, price, is_active } = req.body;

        const existingButton = await QuickButton.findById(id);
        if (!existingButton) {
            return res.status(404).json({ message: 'Quick button not found' });
        }

        const updated = await QuickButton.update(id, {
            title: title || existingButton.title,
            description: description !== undefined ? description : existingButton.description,
            type: type || existingButton.type,
            price: price !== undefined ? price : existingButton.price,
            is_active: is_active !== undefined ? is_active : existingButton.is_active
        });

        if (updated === 0) {
            return res.status(400).json({ message: 'Update failed' });
        }

        const updatedButton = await QuickButton.findById(id);
        res.json({
            success: true,
            message: 'Quick button updated successfully',
            button: updatedButton
        });
    } catch (error) {
        console.error('Update Quick Button Error:', error);
        res.status(500).json({ message: 'Server error updating quick button' });
    }
};

// @desc    Soft delete a quick button (set inactive)
// @route   DELETE /api/admin/quick-buttons/:id
// @access  Admin
exports.deleteButton = async (req, res) => {
    try {
        const { id } = req.params;

        const existingButton = await QuickButton.findById(id);
        if (!existingButton) {
            return res.status(404).json({ message: 'Quick button not found' });
        }

        const deleted = await QuickButton.delete(id);
        if (deleted === 0) {
            return res.status(400).json({ message: 'Delete failed' });
        }

        res.json({
            success: true,
            message: 'Quick button deactivated successfully'
        });
    } catch (error) {
        console.error('Delete Quick Button Error:', error);
        res.status(500).json({ message: 'Server error deleting quick button' });
    }
};