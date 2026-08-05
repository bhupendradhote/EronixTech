const Cart = require('../models/Cart');
const db = require('../config/db');

// Helper to parse JSON fields for product data
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

const cartController = {
    // Get cart
    getCart: async (req, res) => {
        try {
            const customerId = req.user.id;
            const cart = await Cart.getOrCreateCart(customerId);
            const items = await Cart.getCartItems(cart.id);

            const formattedItems = items.map(item => parseJSONFields(item));

            res.status(200).json({
                success: true,
                data: {
                    cart_id: cart.id,
                    total_amount: cart.total_amount,
                    items: formattedItems
                }
            });
        } catch (error) {
            console.error('Get Cart Error:', error);
            res.status(500).json({ success: false, message: 'Error fetching cart', error: error.message });
        }
    },

    // Add product
    addToCart: async (req, res) => {
        try {
            const customerId = req.user.id;
            const { product_id, quantity = 1 } = req.body;

            if (!product_id || quantity < 1) {
                return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
            }

            const [products] = await db.execute(
                `SELECT selling_price, stock_quantity, stock_status FROM products WHERE id = ? AND deleted_at IS NULL AND status = 'active'`, 
                [product_id]
            );

            if (products.length === 0) {
                return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
            }

            const product = products[0];

            if (product.stock_status !== 'in_stock' || product.stock_quantity < quantity) {
                return res.status(400).json({ success: false, message: 'Not enough stock available' });
            }

            const cart = await Cart.getOrCreateCart(customerId);
            await Cart.upsertItem(cart.id, product_id, quantity, product.selling_price);

            res.status(201).json({ success: true, message: 'Product added to cart' });
        } catch (error) {
            console.error('Add To Cart Error:', error);
            res.status(500).json({ success: false, message: 'Error adding to cart', error: error.message });
        }
    },

    // Update quantity
    updateQuantity: async (req, res) => {
        try {
            const customerId = req.user.id;
            const { cartItemId } = req.params;
            const { quantity } = req.body;

            if (quantity < 1) {
                return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
            }

            const cart = await Cart.getOrCreateCart(customerId);
            await Cart.updateItemQuantity(cartItemId, cart.id, quantity);

            res.status(200).json({ success: true, message: 'Cart updated successfully' });
        } catch (error) {
            console.error('Update Cart Quantity Error:', error);
            res.status(500).json({ success: false, message: 'Error updating cart', error: error.message });
        }
    },

    // Remove item
    removeItem: async (req, res) => {
        try {
            const customerId = req.user.id;
            const { cartItemId } = req.params;

            const cart = await Cart.getOrCreateCart(customerId);
            const affectedRows = await Cart.removeItem(cartItemId, cart.id);

            if (affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Item not found in your cart' });
            }

            res.status(200).json({ success: true, message: 'Item removed from cart' });
        } catch (error) {
            console.error('Remove From Cart Error:', error);
            res.status(500).json({ success: false, message: 'Error removing item from cart', error: error.message });
        }
    },

    // Clear cart
    clearCart: async (req, res) => {
        try {
            const customerId = req.user.id;
            const cart = await Cart.getOrCreateCart(customerId);
            await Cart.clearCart(cart.id);

            res.status(200).json({ success: true, message: 'Cart cleared successfully' });
        } catch (error) {
            console.error('Clear Cart Error:', error);
            res.status(500).json({ success: false, message: 'Error clearing cart', error: error.message });
        }
    },

    // Add warranty to cart
    addWarrantyToCart: async (req, res) => {
        try {
            const customerId = req.user.id;
            const { product_id, variant_id, warranty_name, warranty_price, quantity = 1 } = req.body;

            if (!product_id || !warranty_name || warranty_price == null) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields: product_id, warranty_name, warranty_price' 
                });
            }

            const [products] = await db.execute(
                'SELECT id FROM products WHERE id = ? AND deleted_at IS NULL',
                [product_id]
            );
            if (products.length === 0) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            const cart = await Cart.getOrCreateCart(customerId);

            await Cart.upsertWarrantyItem(
                cart.id,
                product_id,
                variant_id || null,
                warranty_name,
                warranty_price,
                quantity
            );

            res.status(201).json({ success: true, message: 'Extended warranty added to cart' });
        } catch (error) {
            console.error('Add Warranty Error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error adding warranty to cart', 
                error: error.message 
            });
        }
    }
};

module.exports = cartController;