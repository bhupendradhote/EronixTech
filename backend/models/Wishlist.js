const db = require('../config/db');

class Wishlist {
    // 1. Add an item to the wishlist
    static async add(customerId, productId) {
        const query = `INSERT INTO wishlists (customer_id, product_id) VALUES (?, ?)`;
        const [result] = await db.execute(query, [customerId, productId]);
        return result.insertId;
    }

    // 2. Check if a product is already in the user's wishlist to prevent duplicates
    static async checkIfExists(customerId, productId) {
        const query = `SELECT id FROM wishlists WHERE customer_id = ? AND product_id = ?`;
        const [rows] = await db.execute(query, [customerId, productId]);
        return rows.length > 0;
    }

    // 3. Get all wishlist items for a specific user (Joined with products table)
    static async findAllByCustomerId(customerId) {
        // Using a JOIN to return the actual product details along with the wishlist ID
        const query = `
            SELECT w.id AS wishlist_entry_id, w.created_at AS wishlisted_at, p.* FROM wishlists w
            JOIN products p ON w.product_id = p.id
            WHERE w.customer_id = ? AND p.deleted_at IS NULL
            ORDER BY w.created_at DESC
        `;
        const [rows] = await db.execute(query, [customerId]);
        return rows;
    }

    // 4. Remove an item from the wishlist
    static async remove(customerId, productId) {
        const query = `DELETE FROM wishlists WHERE customer_id = ? AND product_id = ?`;
        const [result] = await db.execute(query, [customerId, productId]);
        return result.affectedRows;
    }
}

module.exports = Wishlist;