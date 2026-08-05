const GameRate = require('../models/GameRate');

// ========== PUBLIC ==========
// @desc    Get all active rates
// @route   GET /api/game-rates
exports.getActiveRates = async (req, res) => {
    try {
        const rates = await GameRate.getActiveRates();
        res.json({ success: true, rates });
    } catch (error) {
        console.error('Get Active Rates Error:', error);
        res.status(500).json({ message: 'Server error fetching rates' });
    }
};

// ========== ADMIN CRUD ==========
// @desc    Get all rates
// @route   GET /api/admin/game-rates
// @access  Admin
exports.getAllRates = async (req, res) => {
    try {
        const rates = await GameRate.getAllRates();
        res.json({ success: true, rates });
    } catch (error) {
        console.error('Get All Rates Error:', error);
        res.status(500).json({ message: 'Server error fetching rates' });
    }
};

// @desc    Get single rate by ID
// @route   GET /api/admin/game-rates/:id
// @access  Admin
exports.getRateById = async (req, res) => {
    try {
        const rate = await GameRate.findById(req.params.id);
        if (!rate) {
            return res.status(404).json({ message: 'Rate not found' });
        }
        res.json({ success: true, rate });
    } catch (error) {
        console.error('Get Rate By ID Error:', error);
        res.status(500).json({ message: 'Server error fetching rate' });
    }
};

// @desc    Create a new rate
// @route   POST /api/admin/game-rates
// @access  Admin
exports.createRate = async (req, res) => {
    try {
        const { name, price } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const rateId = await GameRate.create({ name, price });
        const newRate = await GameRate.findById(rateId);
        res.status(201).json({
            success: true,
            message: 'Rate created successfully',
            rate: newRate
        });
    } catch (error) {
        console.error('Create Rate Error:', error);
        res.status(500).json({ message: 'Server error creating rate' });
    }
};

// @desc    Update a rate
// @route   PUT /api/admin/game-rates/:id
// @access  Admin
exports.updateRate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, is_active } = req.body;

        const existing = await GameRate.findById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Rate not found' });
        }

        const updated = await GameRate.update(id, {
            name: name || existing.name,
            price: price !== undefined ? price : existing.price,
            is_active: is_active !== undefined ? is_active : existing.is_active
        });

        if (updated === 0) {
            return res.status(400).json({ message: 'Update failed' });
        }

        const updatedRate = await GameRate.findById(id);
        res.json({
            success: true,
            message: 'Rate updated successfully',
            rate: updatedRate
        });
    } catch (error) {
        console.error('Update Rate Error:', error);
        res.status(500).json({ message: 'Server error updating rate' });
    }
};

// @desc    Soft delete a rate
// @route   DELETE /api/admin/game-rates/:id
// @access  Admin
exports.deleteRate = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await GameRate.findById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Rate not found' });
        }

        const deleted = await GameRate.delete(id);
        if (deleted === 0) {
            return res.status(400).json({ message: 'Delete failed' });
        }

        res.json({
            success: true,
            message: 'Rate deactivated successfully'
        });
    } catch (error) {
        console.error('Delete Rate Error:', error);
        res.status(500).json({ message: 'Server error deleting rate' });
    }
};