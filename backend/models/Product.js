const db = require('../config/db');

class Product {
    // 1. Create a new product (Dynamic Insert for massive field list)
    static async create(productData) {
        const fields = [];
        const placeholders = [];
        const values = [];

        for (const [key, value] of Object.entries(productData)) {
            // Exclude empty strings or undefined to allow MySQL default values to kick in
            if (value !== undefined && value !== '') {
                fields.push(`\`${key}\``); // Backticks handle reserved words like `condition`
                placeholders.push('?');
                values.push(value);
            }
        }

        const query = `INSERT INTO products (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;

        const [result] = await db.execute(query, values);
        return result.insertId;
    }

    // 2. Find all products (With Pagination and optional filters)
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM products WHERE 1=1 AND deleted_at IS NULL';
        let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1 AND deleted_at IS NULL';
        const values = [];

        // Dynamic filtering based on query parameters
        if (filters.status) {
            query += ' AND status = ?';
            countQuery += ' AND status = ?';
            values.push(filters.status);
        }
        if (filters.category_id) {
            query += ' AND category_id = ?';
            countQuery += ' AND category_id = ?';
            values.push(filters.category_id);
        }
        if (filters.is_active) {
            query += ' AND status = "active"';
            countQuery += ' AND status = "active"';
        }

        query += ' ORDER BY created_at DESC';

        // --- Pagination Logic ---
        const MAX_LIMIT = 5000; // allow admin to pull the full catalog
        let limit = filters.limit ? parseInt(filters.limit, 10) : 12; // Default limit 12
        const page = filters.page ? parseInt(filters.page, 10) : 1;

        if (!Number.isFinite(limit) || limit <= 0) limit = 12;
        if (limit > MAX_LIMIT) limit = MAX_LIMIT;

        let offset = (page - 1) * limit;
        if (!Number.isFinite(offset) || offset < 0) offset = 0;

        // Inline sanitized integers — mysql2 prepared statements can fail on "LIMIT ? OFFSET ?"
        query += ` LIMIT ${limit} OFFSET ${offset}`;

        const [countResult] = await db.execute(countQuery, values);
        const totalItems = countResult[0].total;

        const [rows] = await db.execute(query, values);

        return {
            data: rows,
            total: totalItems
        };
    }

    // 3. Find a single product by ID
    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM products WHERE id = ? AND deleted_at IS NULL', [id]);
        return rows[0];
    }

    static async findBySlug(slug) {
        const [rows] = await db.execute('SELECT * FROM products WHERE slug = ?', [slug]);
        return rows[0];
    }

    // 4. Update an existing product (Dynamic update)
    static async update(id, updateData) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`\`${key}\` = ?`);
            values.push(value);
        }

        if (fields.length === 0) return 0;

        values.push(id);
        const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;

        const [result] = await db.execute(query, values);
        return result.affectedRows;
    }

    // 5. Soft Delete a product (Sets deleted_at timestamp instead of permanently removing)
    static async delete(id) {
        const [result] = await db.execute(
            'UPDATE products SET deleted_at = CURRENT_TIMESTAMP, status = "archived" WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }
}

module.exports = Product;