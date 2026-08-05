const db = require('../config/db');
const bcrypt = require('bcrypt');

class Salesperson {
    // Get all salespersons (admin)
    static async getAll(tenantId) {
        // Exclude password from result
        const [rows] = await db.execute(
            `SELECT id, name, email, phone, address, profile_image, is_active, created_at, updated_at
             FROM salespersons
             WHERE tenant_id = ?
             ORDER BY name`,
            [tenantId]
        );
        return rows;
    }

    // Get active salespersons (for dropdown, etc.)
    static async getActive(tenantId) {
        const [rows] = await db.execute(
            'SELECT id, name FROM salespersons WHERE tenant_id = ? AND is_active = 1 ORDER BY name',
            [tenantId]
        );
        return rows;
    }

    // Find by ID (exclude password)
    static async findById(id, tenantId) {
        const [rows] = await db.execute(
            `SELECT id, name, email, phone, address, profile_image, is_active, created_at, updated_at
             FROM salespersons
             WHERE id = ? AND tenant_id = ?`,
            [id, tenantId]
        );
        return rows[0];
    }

    // Find by email (for login, includes password)
    static async findByEmail(email, tenantId = null) {
        let query = 'SELECT * FROM salespersons WHERE email = ?';
        const params = [email];
        if (tenantId) {
            query += ' AND tenant_id = ?';
            params.push(tenantId);
        }
        const [rows] = await db.execute(query, params);
        return rows[0]; // returns full row (including password hash)
    }

    // Create
    static async create(data) {
        const { tenantId, name, email, phone, password, address, profile_image } = data;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            `INSERT INTO salespersons
             (tenant_id, name, email, phone, password, address, profile_image)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [tenantId, name, email, phone, hashedPassword, address, profile_image || null]
        );
        return result.insertId;
    }

    // Update
    static async update(id, tenantId, data) {
        const { name, email, phone, password, address, profile_image, is_active } = data;

        let query = `UPDATE salespersons SET `;
        const params = [];

        if (name !== undefined) {
            query += `name = ?, `;
            params.push(name);
        }
        if (email !== undefined) {
            query += `email = ?, `;
            params.push(email);
        }
        if (phone !== undefined) {
            query += `phone = ?, `;
            params.push(phone);
        }
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            query += `password = ?, `;
            params.push(hashed);
        }
        if (address !== undefined) {
            query += `address = ?, `;
            params.push(address);
        }
        if (profile_image !== undefined) {
            query += `profile_image = ?, `;
            params.push(profile_image);
        }
        if (is_active !== undefined) {
            query += `is_active = ?, `;
            params.push(is_active);
        }

        // Remove trailing comma and space
        query = query.replace(/,\s*$/, '');
        query += ` WHERE id = ? AND tenant_id = ?`;
        params.push(id, tenantId);

        const [result] = await db.execute(query, params);
        return result.affectedRows;
    }

    // Soft delete (set is_active = 0)
    static async delete(id, tenantId) {
        const [result] = await db.execute(
            'UPDATE salespersons SET is_active = 0 WHERE id = ? AND tenant_id = ?',
            [id, tenantId]
        );
        return result.affectedRows;
    }

    // Hard delete (optional)
    static async hardDelete(id, tenantId) {
        const [result] = await db.execute(
            'DELETE FROM salespersons WHERE id = ? AND tenant_id = ?',
            [id, tenantId]
        );
        return result.affectedRows;
    }
}

module.exports = Salesperson;