const db = require('../config/db');

class AvailableGame {
    // Public: active games with device name
    static async getActiveGames() {
        const [rows] = await db.execute(`
            SELECT ag.id, ag.name, ag.genre, ag.image_url, ag.description,
                   gd.name AS platform   -- alias for frontend compatibility
            FROM available_games ag
            LEFT JOIN game_devices gd ON ag.game_device_id = gd.id
            WHERE ag.is_active = 1
            ORDER BY ag.name
        `);
        return rows;
    }

    // Admin: all games with device info
    static async getAllGames() {
        const [rows] = await db.execute(`
            SELECT ag.id, ag.name, ag.genre, ag.image_url, ag.description,
                   ag.is_active, ag.created_at, ag.updated_at,
                   ag.game_device_id, gd.name AS platform
            FROM available_games ag
            LEFT JOIN game_devices gd ON ag.game_device_id = gd.id
            ORDER BY ag.name
        `);
        return rows;
    }

    // Find by ID
    static async findById(id) {
        const [rows] = await db.execute(`
            SELECT ag.*, gd.name AS platform
            FROM available_games ag
            LEFT JOIN game_devices gd ON ag.game_device_id = gd.id
            WHERE ag.id = ?
        `, [id]);
        return rows[0];
    }

    // Create – now expects game_device_id
    static async create(gameData) {
        const { name, genre, image_url, description, game_device_id } = gameData;
        const [result] = await db.execute(
            `INSERT INTO available_games (name, genre, image_url, description, game_device_id)
             VALUES (?, ?, ?, ?, ?)`,
            [name, genre, image_url, description || null, game_device_id]
        );
        return result.insertId;
    }

    // Update
    static async update(id, gameData) {
        const { name, genre, image_url, description, game_device_id, is_active } = gameData;
        const [result] = await db.execute(
            `UPDATE available_games 
             SET name = ?, genre = ?, image_url = ?, description = ?,
                 game_device_id = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [name, genre, image_url, description || null, game_device_id, is_active, id]
        );
        return result.affectedRows;
    }

    // Soft delete
    static async delete(id) {
        const [result] = await db.execute(
            'UPDATE available_games SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    // Hard delete (optional)
    static async hardDelete(id) {
        const [result] = await db.execute('DELETE FROM available_games WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = AvailableGame;