const db = require('../config/db');

class AvailableGame {
    // Get all active games (public)
    static async getActiveGames() {
        const [rows] = await db.execute(
            'SELECT id, name, genre, image_url, description, platform FROM available_games WHERE is_active = 1 ORDER BY name'
        );
        return rows;
    }

    // Get all games (admin)
    static async getAllGames() {
        const [rows] = await db.execute(
            'SELECT id, name, genre, image_url, description, platform, is_active, created_at, updated_at FROM available_games ORDER BY name'
        );
        return rows;
    }

    // Find game by ID
    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM available_games WHERE id = ?', [id]);
        return rows[0];
    }

    // Create a new game
    static async create(gameData) {
        const { name, genre, image_url, description, platform } = gameData;
        const [result] = await db.execute(
            `INSERT INTO available_games (name, genre, image_url, description, platform)
             VALUES (?, ?, ?, ?, ?)`,
            [name, genre, image_url, description || null, platform || 'all']
        );
        return result.insertId;
    }

    // Update an existing game
    static async update(id, gameData) {
        const { name, genre, image_url, description, platform, is_active } = gameData;
        const [result] = await db.execute(
            `UPDATE available_games 
             SET name = ?, genre = ?, image_url = ?, description = ?, platform = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [name, genre, image_url, description || null, platform || 'all', is_active, id]
        );
        return result.affectedRows;
    }

    // Soft delete (set is_active = 0)
    static async delete(id) {
        const [result] = await db.execute(
            'UPDATE available_games SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    // Hard delete (optional - not recommended)
    static async hardDelete(id) {
        const [result] = await db.execute('DELETE FROM available_games WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = AvailableGame;     