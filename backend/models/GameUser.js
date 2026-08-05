const db = require('../config/db');

class GameUser {
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM game_users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findByUsername(username) {
        const [rows] = await db.execute('SELECT * FROM game_users WHERE username = ?', [username]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT id, username, email, full_name, phone_number, is_active, coins, level, 
                    created_at, updated_at, last_login
             FROM game_users WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    static async create(userData) {
        const { username, email, full_name, password_hash, phone_number } = userData;
        const [result] = await db.execute(
            `INSERT INTO game_users (username, email, full_name, password_hash, phone_number)
             VALUES (?, ?, ?, ?, ?)`,
            [username, email, full_name, password_hash, phone_number || null]
        );
        return result.insertId;
    }

    static async updateLastLogin(id) {
        await db.execute(
            'UPDATE game_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
    }

    static async updatePassword(id, newPasswordHash) {
        const [result] = await db.execute(
            'UPDATE game_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newPasswordHash, id]
        );
        return result.affectedRows;
    }

    static async getPasswordHashById(id) {
        const [rows] = await db.execute('SELECT password_hash FROM game_users WHERE id = ?', [id]);
        return rows[0];
    }

    // Optional: update coins/level etc.
    static async updateCoins(id, coins) {
        await db.execute(
            'UPDATE game_users SET coins = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [coins, id]
        );
    }

    // Add these static methods to GameUser class

static async updateProfile(id, updateData) {
    const { full_name, phone_number } = updateData;
    const [result] = await db.execute(
        `UPDATE game_users 
         SET full_name = ?, phone_number = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [full_name, phone_number, id]
    );
    return result.affectedRows;
}

static async updatePassword(id, newPasswordHash) {
    const [result] = await db.execute(
        `UPDATE game_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [newPasswordHash, id]
    );
    return result.affectedRows;
}
}

module.exports = GameUser;