const Wishlist = require('../models/Wishlist');

// Helper function reused to safely parse DB JSON strings for the joined product data
const parseJSONFields = (product) => {
    const jsonFields = ['key_features', 'images', 'offers', 'variants', 'specifications'];
    jsonFields.forEach(field => {
        if (product[field] && typeof product[field] === 'string') {
            try {
                product[field] = JSON.parse(product[field]);
            } catch (e) {
                console.warn(`Could not parse JSON for field: ${field} in product ID: ${product.id}`);
            }
        }
    });
    return product;
};

const wishlistController = {
    // 1. Add product to wishlist
    addToWishlist: async (req, res) => {
        try {
            const { product_id } = req.body;
            const customer_id = req.user.id; // Extracted from the JWT auth middleware

            if (!product_id) {
                return res.status(400).json({ success: false, message: 'Product ID is required' });
            }

            // Check if it already exists
            const exists = await Wishlist.checkIfExists(customer_id, product_id);
            if (exists) {
                return res.status(400).json({ success: false, message: 'Product is already in your wishlist' });
            }

            const insertId = await Wishlist.add(customer_id, product_id);

            res.status(201).json({ 
                success: true, 
                message: 'Product added to wishlist', 
                data: { id: insertId, customer_id, product_id } 
            });
        } catch (error) {
            console.error('Add To Wishlist Error:', error);
            res.status(500).json({ success: false, message: 'Error adding to wishlist', error: error.message });
        }
    },

    // 2. Get user's wishlist
    getWishlist: async (req, res) => {
        try {
            const customer_id = req.user.id; // Extracted from the JWT auth middleware

            const wishlistItems = await Wishlist.findAllByCustomerId(customer_id);

            // Parse JSON fields for all joined products before sending to frontend
            const formattedWishlist = wishlistItems.map(item => parseJSONFields(item));

            res.status(200).json({ success: true, data: formattedWishlist });
        } catch (error) {
            console.error('Get Wishlist Error:', error);
            res.status(500).json({ success: false, message: 'Error fetching wishlist', error: error.message });
        }
    },

    // 3. Remove product from wishlist
    removeFromWishlist: async (req, res) => {
        try {
            const { productId } = req.params;
            const customer_id = req.user.id; // Ensure a user can only delete their own wishlist items

            const affectedRows = await Wishlist.remove(customer_id, productId);

            if (affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Product not found in your wishlist' });
            }

            res.status(200).json({ success: true, message: 'Product removed from wishlist' });
        } catch (error) {
            console.error('Remove From Wishlist Error:', error);
            res.status(500).json({ success: false, message: 'Error removing from wishlist', error: error.message });
        }
    }
};

module.exports = wishlistController;