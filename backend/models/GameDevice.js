const db = require('../config/db');

class GameDevice {
    // Get all active devices (public)
    static async getActiveDevices() {
        const [rows] = await db.execute(
            'SELECT id, name FROM game_devices WHERE is_active = 1 ORDER BY name'
        );
        return rows;
    }

    // Get all devices (admin)
    static async getAllDevices() {
        const [rows] = await db.execute(
            'SELECT id, name, is_active, created_at, updated_at FROM game_devices ORDER BY name'
        );
        return rows;
    }

    // Find by ID
    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM game_devices WHERE id = ?', [id]);
        return rows[0];
    }

    // Create
    static async create(data) {
        const { name } = data;
        const [result] = await db.execute(
            'INSERT INTO game_devices (name) VALUES (?)',
            [name]
        );
        return result.insertId;
    }

    // Update
    static async update(id, data) {
        const { name, is_active } = data;
        const [result] = await db.execute(
            `UPDATE game_devices 
             SET name = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [name, is_active, id]
        );
        return result.affectedRows;
    }

    // Soft delete
    static async delete(id) {
        const [result] = await db.execute(
            'UPDATE game_devices SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    // Hard delete (optional)
    static async hardDelete(id) {
        const [result] = await db.execute('DELETE FROM game_devices WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = GameDevice;