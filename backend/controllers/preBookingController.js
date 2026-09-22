const PreBooking = require('../models/PreBooking');

const ALLOWED_STATUSES = ['Pending', 'Contacted', 'Completed', 'Cancelled'];

const preBookingController = {
    // 1. Create a new pre-booking request
    createPreBooking: async (req, res) => {
        try {
            const {
                productId,
                variantId,
                productName,
                variantName,
                name,
                email,
                phone,
                quantity,
                pincode,
                message,
            } = req.body;

            if (!productId || !productName || !name || !email || !phone || !quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: productId, productName, name, email, phone, quantity.',
                });
            }

            if (!/^\d{10}$/.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid 10-digit mobile number.',
                });
            }

            if (pincode && !/^\d{6}$/.test(pincode)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid 6-digit PIN code.',
                });
            }

            const qty = Number(quantity);
            if (!Number.isInteger(qty) || qty < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity must be a positive integer.',
                });
            }

            const insertId = await PreBooking.create({
                product_id: productId,
                variant_id: variantId || null,
                product_name: productName,
                variant_name: variantName || null,
                name,
                email,
                phone,
                quantity: qty,
                pincode: pincode || null,
                message: message || null,
            });

            const newPreBooking = await PreBooking.findById(insertId);

            res.status(201).json({
                success: true,
                message: 'Pre-booking request submitted successfully.',
                data: newPreBooking,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Error creating pre-booking request',
                error: error.message,
            });
        }
    },

    // 2. Get all pre-bookings (admin)
    getAllPreBookings: async (req, res) => {
        try {
            const preBookings = await PreBooking.findAll();
            res.status(200).json({ success: true, data: preBookings });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Error fetching pre-bookings',
                error: error.message,
            });
        }
    },

    // 3. Get a single pre-booking by ID (admin)
    getPreBookingById: async (req, res) => {
        try {
            const { id } = req.params;
            const preBooking = await PreBooking.findById(id);
            if (!preBooking) {
                return res.status(404).json({
                    success: false,
                    message: 'Pre-booking not found',
                });
            }
            res.status(200).json({ success: true, data: preBooking });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Error fetching pre-booking',
                error: error.message,
            });
        }
    },

    // 4. Update the status of a pre-booking (admin)
    updatePreBookingStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status || !ALLOWED_STATUSES.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
                });
            }

            const existing = await PreBooking.findById(id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Pre-booking not found',
                });
            }

            await PreBooking.updateStatus(id, status);
            const updated = await PreBooking.findById(id);

            res.status(200).json({
                success: true,
                message: 'Status updated successfully',
                data: updated,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Error updating pre-booking status',
                error: error.message,
            });
        }
    },

    // 5. Delete a pre-booking (admin)
    deletePreBooking: async (req, res) => {
        try {
            const { id } = req.params;
            const existing = await PreBooking.findById(id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Pre-booking not found',
                });
            }
            await PreBooking.delete(id);
            res.status(200).json({
                success: true,
                message: 'Pre-booking deleted successfully',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Error deleting pre-booking',
                error: error.message,
            });
        }
    },
};

module.exports = preBookingController;