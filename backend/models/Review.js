const db = require('../config/db');

class Review {
    // 1. Create
    static async create(reviewData) {
        const fields = [];
        const placeholders = [];
        const values = [];

        for (const [key, value] of Object.entries(reviewData)) {
            if (value !== undefined && value !== '') {
                fields.push(`\`${key}\``);
                placeholders.push('?');
                values.push(value);
            }
        }

        const query = `INSERT INTO product_reviews (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
        const [result] = await db.execute(query, values);
        return result.insertId;
    }

    // 2. Get reviews with user name
    static async findByProductId(productId, status = 'approved') {
        let query = `
            SELECT pr.*, u.full_name AS customer_name
            FROM product_reviews pr
            LEFT JOIN users u ON pr.customer_id = u.id
            WHERE pr.product_id = ?
        `;
        const values = [productId];

        if (status) {
            query += ' AND pr.status = ?';
            values.push(status);
        }

        query += ' ORDER BY pr.created_at DESC';
        const [rows] = await db.execute(query, values);
        return rows;
    }

    // 3. Find single
    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM product_reviews WHERE id = ?', [id]);
        return rows[0];
    }

    // 4. Update status
    static async updateStatus(id, status) {
        const query = `UPDATE product_reviews SET status = ? WHERE id = ?`;
        const [result] = await db.execute(query, [status, id]);
        return result.affectedRows;
    }

    // 5. Delete
    static async delete(id, customerId = null) {
        let query = 'DELETE FROM product_reviews WHERE id = ?';
        const values = [id];

        if (customerId) {
            query += ' AND customer_id = ?';
            values.push(customerId);
        }

        const [result] = await db.execute(query, values);
        return result.affectedRows;
    }

    // Add this inside class Review in Review.js
    static async getAllForAdmin() {
        const query = `
            SELECT pr.*, u.full_name AS customer_name
            FROM product_reviews pr
            LEFT JOIN users u ON pr.customer_id = u.id
            ORDER BY pr.created_at DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
}

module.exports = Review;