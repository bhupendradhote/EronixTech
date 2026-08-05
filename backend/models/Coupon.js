const db = require('../config/db');

class Coupon {
    // 1. Create a new coupon (Dynamic Insert)
    static async create(couponData) {
        const fields = [];
        const placeholders = [];
        const values = [];

        for (const [key, value] of Object.entries(couponData)) {
            if (value !== undefined && value !== '') {
                fields.push(`\`${key}\``);
                placeholders.push('?');
                values.push(value);
            }
        }

        const query = `INSERT INTO coupons (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
        
        const [result] = await db.execute(query, values);
        return result.insertId;
    }

    // 2. Find all coupons (With optional filters)
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM coupons WHERE 1=1 AND deleted_at IS NULL';
        const values = [];

        if (filters.status) {
            query += ' AND status = ?';
            values.push(filters.status);
        }
        
        // Filter out expired coupons if requested
        if (filters.active_only === 'true') {
            query += ' AND status = "active" AND valid_until >= CURRENT_TIMESTAMP AND (valid_from <= CURRENT_TIMESTAMP OR valid_from IS NULL)';
        }

        query += ' ORDER BY created_at DESC';
        
        const [rows] = await db.execute(query, values);
        return rows;
    }

    // 3. Find a single coupon by ID
    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM coupons WHERE id = ? AND deleted_at IS NULL', [id]);
        return rows[0];
    }

    // 4. Find a single coupon by its Code (Crucial for applying discounts)
    static async findByCode(code) {
        const [rows] = await db.execute('SELECT * FROM coupons WHERE code = ? AND deleted_at IS NULL', [code]);
        return rows[0];
    }

    // 5. Update an existing coupon (Dynamic update)
    static async update(id, updateData) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`\`${key}\` = ?`);
            values.push(value);
        }

        if (fields.length === 0) return 0;

        values.push(id);
        const query = `UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await db.execute(query, values);
        return result.affectedRows;
    }

    // 6. Soft Delete a coupon
    static async delete(id) {
        const [result] = await db.execute(
            'UPDATE coupons SET deleted_at = CURRENT_TIMESTAMP, status = "archived" WHERE id = ?', 
            [id]
        );
        return result.affectedRows;
    }

    // 7. Increment usage count
    static async incrementUsage(id) {
        const [result] = await db.execute(
            'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', 
            [id]
        );
        return result.affectedRows;
    }
}

module.exports = Coupon;