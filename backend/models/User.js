const db = require('../config/db');

class User {
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findByPhone(phone_number) {
        const [rows] = await db.execute('SELECT * FROM users WHERE phone_number = ?', [phone_number]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT id, full_name, email, phone_number, date_of_birth, is_active, created_at FROM users WHERE id = ?', 
            [id]
        );
        return rows[0];
    }

    static async create(userData) {
        const { full_name, email, phone_number, password_hash, date_of_birth } = userData;
        const [result] = await db.execute(
            `INSERT INTO users (full_name, email, phone_number, password_hash, date_of_birth) 
             VALUES (?, ?, ?, ?, ?)`,
            [full_name, email, phone_number, password_hash, date_of_birth || null]
        );
        return result.insertId;
    }

    static async update(id, updateData) {
        const { full_name, email, phone_number, date_of_birth } = updateData;
        
        const [result] = await db.execute(
            `UPDATE users 
             SET full_name = ?, 
                 email = ?, 
                 phone_number = ?, 
                 date_of_birth = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                full_name, 
                email, 
                phone_number || null, 
                date_of_birth || null, 
                id
            ]
        );
        
        return result.affectedRows; 
    }

    static async getPasswordHashById(id) {
        const [rows] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async updatePassword(id, newPasswordHash) {
        const [result] = await db.execute(
            'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
            [newPasswordHash, id]
        );
        return result.affectedRows;
    }

    static async getAllUsersWithAddresses() {
        const query = `
            SELECT 
                u.id as user_id, u.full_name, u.email, u.phone_number, u.date_of_birth, u.is_active, u.created_at,
                a.id as address_id, a.address_line_1, a.address_line_2, a.city, a.state, a.postal_code, a.country, a.address_type, a.is_default_shipping, a.is_default_billing
            FROM users u
            LEFT JOIN user_addresses a ON u.id = a.user_id 
            ORDER BY u.id DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
}



module.exports = User;