const db = require('../config/db');

class GameRate {
    // Get all active rates (public)
    static async getActiveRates() {
        const [rows] = await db.execute(
            'SELECT id, name, price FROM game_rates WHERE is_active = 1 ORDER BY name'
        );
        return rows;
    }

    // Get all rates (admin)
    static async getAllRates() {
        const [rows] = await db.execute(
            'SELECT id, name, price, is_active, created_at, updated_at FROM game_rates ORDER BY name'
        );
        return rows;
    }

    // Find by ID
    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM game_rates WHERE id = ?', [id]);
        return rows[0];
    }

    // Create
    static async create(data) {
        const { name, price } = data;
        const [result] = await db.execute(
            'INSERT INTO game_rates (name, price) VALUES (?, ?)',
            [name, price || 0]
        );
        return result.insertId;
    }

    // Update
    static async update(id, data) {
        const { name, price, is_active } = data;
        const [result] = await db.execute(
            `UPDATE game_rates 
             SET name = ?, price = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [name, price || 0, is_active, id]
        );
        return result.affectedRows;
    }

    // Soft delete
    static async delete(id) {
        const [result] = await db.execute(
            'UPDATE game_rates SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    // Hard delete (optional)
    static async hardDelete(id) {
        const [result] = await db.execute('DELETE FROM game_rates WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = GameRate;