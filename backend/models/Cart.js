const db = require('../config/db');

class Cart {
    // 1. Get or create a master cart for a user
    static async getOrCreateCart(customerId) {
        const [existingCarts] = await db.execute(`SELECT * FROM carts WHERE customer_id = ?`, [customerId]);
        if (existingCarts.length > 0) {
            return existingCarts[0];
        }
        const [result] = await db.execute(`INSERT INTO carts (customer_id, total_amount) VALUES (?, 0.00)`, [customerId]);
        const [newCart] = await db.execute(`SELECT * FROM carts WHERE id = ?`, [result.insertId]);
        return newCart[0];
    }

    // 2. Get cart items with product details (includes warranty fields)
    static async getCartItems(cartId) {
        const query = `
            SELECT 
                ci.id AS cart_item_id, 
                ci.quantity, 
                ci.unit_price, 
                ci.total_price,
                ci.is_warranty,
                ci.warranty_name,
                ci.warranty_price,
                ci.variant_id,
                p.* 
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ? AND p.deleted_at IS NULL
            ORDER BY ci.created_at DESC
        `;
        const [items] = await db.execute(query, [cartId]);
        return items;
    }

    // 3. Add a product (without warranty) – is_warranty = 0, warranty_price = 0
    static async upsertItem(cartId, productId, quantity, unitPrice) {
        const totalPrice = quantity * unitPrice;
        const query = `
            INSERT INTO cart_items 
            (cart_id, product_id, quantity, unit_price, total_price, is_warranty, warranty_price)
            VALUES (?, ?, ?, ?, ?, 0, 0)
            ON DUPLICATE KEY UPDATE 
                quantity = quantity + VALUES(quantity),
                total_price = quantity * unit_price,
                is_warranty = 0,
                warranty_price = 0,
                warranty_name = NULL
        `;
        await db.execute(query, [cartId, productId, quantity, unitPrice, totalPrice]);
        await this.recalculateCartTotal(cartId);
    }

    // 4. Update exact quantity of a cart item (preserves warranty if set)
    static async updateItemQuantity(cartItemId, cartId, quantity) {
        // Get current warranty_price and unit_price
        const [rows] = await db.execute(
            `SELECT unit_price, warranty_price FROM cart_items WHERE id = ? AND cart_id = ?`,
            [cartItemId, cartId]
        );
        if (rows.length === 0) return;
        const { unit_price, warranty_price } = rows[0];
        const totalPrice = (unit_price * quantity) + warranty_price;
        const query = `
            UPDATE cart_items 
            SET quantity = ?, total_price = ? 
            WHERE id = ? AND cart_id = ?
        `;
        await db.execute(query, [quantity, totalPrice, cartItemId, cartId]);
        await this.recalculateCartTotal(cartId);
    }

    // 5. Remove an item
    static async removeItem(cartItemId, cartId) {
        const query = `DELETE FROM cart_items WHERE id = ? AND cart_id = ?`;
        const [result] = await db.execute(query, [cartItemId, cartId]);
        await this.recalculateCartTotal(cartId);
        return result.affectedRows;
    }

    // 6. Clear all items
    static async clearCart(cartId) {
        await db.execute(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
        await this.recalculateCartTotal(cartId);
    }

    // 7. Recalculate cart total
    static async recalculateCartTotal(cartId) {
        const sumQuery = `SELECT IFNULL(SUM(total_price), 0) as grand_total FROM cart_items WHERE cart_id = ?`;
        const [sumResult] = await db.execute(sumQuery, [cartId]);
        const grandTotal = sumResult[0].grand_total;
        await db.execute(`UPDATE carts SET total_amount = ? WHERE id = ?`, [grandTotal, cartId]);
    }

    // 8. Add or update warranty on an existing product row
    static async upsertWarrantyItem(cartId, productId, variantId, warrantyName, warrantyPrice, quantity) {
        // First check if the product already exists in the cart
        const [existing] = await db.execute(
            `SELECT id, quantity, unit_price, warranty_price FROM cart_items WHERE cart_id = ? AND product_id = ?`,
            [cartId, productId]
        );

        if (existing.length > 0) {
            // Product exists – update the warranty on that row
            const row = existing[0];
            const newWarrantyPrice = warrantyPrice; // we can also accumulate if needed, but we'll overwrite
            const totalPrice = (row.unit_price * row.quantity) + newWarrantyPrice;
            const query = `
                UPDATE cart_items 
                SET 
                    warranty_name = ?,
                    warranty_price = ?,
                    is_warranty = 1,
                    total_price = ?
                WHERE id = ?
            `;
            await db.execute(query, [warrantyName, newWarrantyPrice, totalPrice, row.id]);
        } else {
            // Product not in cart – insert a new row with warranty already attached
            const [product] = await db.execute(
                `SELECT selling_price FROM products WHERE id = ? AND deleted_at IS NULL`,
                [productId]
            );
            if (product.length === 0) {
                throw new Error('Product not found');
            }
            const productPrice = product[0].selling_price;
            const totalPrice = (productPrice * quantity) + warrantyPrice;
            const query = `
                INSERT INTO cart_items 
                (cart_id, product_id, variant_id, quantity, unit_price, total_price, is_warranty, warranty_name, warranty_price)
                VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
            `;
            await db.execute(query, [cartId, productId, variantId, quantity, productPrice, totalPrice, warrantyName, warrantyPrice]);
        }

        await this.recalculateCartTotal(cartId);
    }
}

module.exports = Cart;