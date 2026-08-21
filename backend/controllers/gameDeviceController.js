const GameDevice = require('../models/GameDevice');

// ========== PUBLIC ==========
// @desc    Get all active devices
// @route   GET /api/game-devices
exports.getActiveDevices = async (req, res) => {
    try {
        const devices = await GameDevice.getActiveDevices();
        res.json({ success: true, devices });
    } catch (error) {
        console.error('Get Active Devices Error:', error);
        res.status(500).json({ message: 'Server error fetching devices' });
    }
};

// ========== ADMIN CRUD ==========
// @desc    Get all devices
// @route   GET /api/admin/game-devices
// @access  Admin
exports.getAllDevices = async (req, res) => {
    try {
        const devices = await GameDevice.getAllDevices();
        res.json({ success: true, devices });
    } catch (error) {
        console.error('Get All Devices Error:', error);
        res.status(500).json({ message: 'Server error fetching devices' });
    }
};

// @desc    Get single device by ID
// @route   GET /api/admin/game-devices/:id
// @access  Admin
exports.getDeviceById = async (req, res) => {
    try {
        const device = await GameDevice.findById(req.params.id);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }
        res.json({ success: true, device });
    } catch (error) {
        console.error('Get Device By ID Error:', error);
        res.status(500).json({ message: 'Server error fetching device' });
    }
};

// @desc    Create a new device
// @route   POST /api/admin/game-devices
// @access  Admin
exports.createDevice = async (req, res) => {
    try {
        const { name, platform = 'PS5' } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const deviceId = await GameDevice.create({ name, platform });
        const newDevice = await GameDevice.findById(deviceId);
        res.status(201).json({
            success: true,
            message: 'Device created successfully',
            device: newDevice
        });
    } catch (error) {
        console.error('Create Device Error:', error);
        res.status(500).json({ message: 'Server error creating device' });
    }
};

// @desc    Update a device
// @route   PUT /api/admin/game-devices/:id
// @access  Admin
exports.updateDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, platform, is_active } = req.body;

        const existing = await GameDevice.findById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Device not found' });
        }

        const updated = await GameDevice.update(id, {
            name: name || existing.name,
            platform: platform || existing.platform || 'PS5',
            is_active: is_active !== undefined ? is_active : existing.is_active
        });

        if (updated === 0) {
            return res.status(400).json({ message: 'Update failed' });
        }

        const updatedDevice = await GameDevice.findById(id);
        res.json({
            success: true,
            message: 'Device updated successfully',
            device: updatedDevice
        });
    } catch (error) {
        console.error('Update Device Error:', error);
        res.status(500).json({ message: 'Server error updating device' });
    }
};

// @desc    Soft delete a device
// @route   DELETE /api/admin/game-devices/:id
// @access  Admin
exports.deleteDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await GameDevice.findById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Device not found' });
        }

        const deleted = await GameDevice.delete(id);
        if (deleted === 0) {
            return res.status(400).json({ message: 'Delete failed' });
        }

        res.json({
            success: true,
            message: 'Device deactivated successfully'
        });
    } catch (error) {
        console.error('Delete Device Error:', error);
        res.status(500).json({ message: 'Server error deleting device' });
    }
};

exports.getDevices = async (req, res) => {
    try {
        const devices = await GameDevice.getAll();
        res.json({ success: true, devices });
    } catch (error) {
        console.error('Get Devices Error:', error);
        res.status(500).json({ message: 'Server error fetching devices' });
    }
};