const db = require('../config/db');

class Admin {
    static async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM admins WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT 
                id,
                full_name,
                email,
                role,
                created_at
            FROM admins
            WHERE id = ?`,
            [id]
        );

        return rows[0];
    }

    static async create(adminData) {
        const {
            full_name,
            email,
            password_hash,
            role = 'super-admin'
        } = adminData;

        const [result] = await db.execute(
            `INSERT INTO admins (
                full_name,
                email,
                password_hash,
                role
            ) VALUES (?, ?, ?, ?)`,
            [
                full_name,
                email,
                password_hash,
                role
            ]
        );

        return result.insertId;
    }

    static async getAll() {
        const [rows] = await db.execute(
            `SELECT
                id,
                full_name,
                email,
                role,
                created_at
            FROM admins
            ORDER BY id DESC`
        );

        return rows;
    }
}

module.exports = Admin;