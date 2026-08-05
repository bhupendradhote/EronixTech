const UserAddress = require('../models/UserAddress');

const userAddressController = {
    // 1. Create a new address
    createAddress: async (req, res) => {
        try {
            // SECURITY: Extract user_id from the verified JWT, NOT the request body
            // Note: If your JWT payload uses a different key, change '.id' to '.userId' etc.
            const user_id = req.user.id; 

            const { is_default_shipping, is_default_billing, ...addressData } = req.body;

            // If new address is set as default, remove default status from older addresses
            if (is_default_shipping || is_default_billing) {
                await UserAddress.resetDefaults(user_id, is_default_shipping, is_default_billing);
            }

            // Combine the secure user_id with the rest of the body data
            const insertPayload = {
                user_id,
                is_default_shipping,
                is_default_billing,
                ...addressData
            };

            const insertId = await UserAddress.create(insertPayload);
            
            // Fetch the newly created address to return to the frontend
            const newAddress = await UserAddress.findById(insertId);

            res.status(201).json({ success: true, message: 'Address created successfully', data: newAddress });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error creating address', error: error.message });
        }
    },

    // 2. Get all addresses for the logged-in user
    getUserAddresses: async (req, res) => {
        try {
            // SECURITY: Get user_id from the token, ignoring URL parameters
            const user_id = req.user.id;
            
            const addresses = await UserAddress.findByUserId(user_id);

            res.status(200).json({ success: true, data: addresses });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching addresses', error: error.message });
        }
    },

    // 3. Update an existing address
    updateAddress: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const user_id = req.user.id; // From JWT

            // Check if address exists
            const existingAddress = await UserAddress.findById(id);
            if (!existingAddress) {
                return res.status(404).json({ success: false, message: 'Address not found' });
            }

            // SECURITY CHECK: Ensure the logged-in user owns this address
            if (existingAddress.user_id !== user_id) {
                return res.status(403).json({ success: false, message: 'Not authorized to update this address' });
            }

            // Handle default resets if updating to a new default
            if (updateData.is_default_shipping || updateData.is_default_billing) {
                await UserAddress.resetDefaults(user_id, updateData.is_default_shipping, updateData.is_default_billing);
            }

            await UserAddress.update(id, updateData);
            
            // Fetch updated address to return
            const updatedAddress = await UserAddress.findById(id);

            res.status(200).json({ success: true, message: 'Address updated successfully', data: updatedAddress });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error updating address', error: error.message });
        }
    },

    // 4. Delete an address
    deleteAddress: async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.user.id; // From JWT

            // Check if address exists
            const existingAddress = await UserAddress.findById(id);
            if (!existingAddress) {
                return res.status(404).json({ success: false, message: 'Address not found' });
            }

            // SECURITY CHECK: Ensure the logged-in user owns this address
            if (existingAddress.user_id !== user_id) {
                return res.status(403).json({ success: false, message: 'Not authorized to delete this address' });
            }

            await UserAddress.delete(id);

            res.status(200).json({ success: true, message: 'Address deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error deleting address', error: error.message });
        }
    },
    
    
// Admin ONLY: Get addresses for ANY user
    getAddressesByUserIdAdmin: async (req, res) => {
        try {
            // Read the ID from the URL parameter, because the Admin is requesting it
            const target_user_id = req.params.userId;
            
            const addresses = await UserAddress.findByUserId(target_user_id);

            res.status(200).json({ success: true, data: addresses });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching addresses', error: error.message });
        }
    },
};

module.exports = userAddressController;