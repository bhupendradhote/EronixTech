const db = require('../config/db');

class QuickButton {
    // Get all active quick buttons (public)
    static async getActiveButtons() {
        const [rows] = await db.execute(
            'SELECT id, title, description, type, price FROM quick_buttons WHERE is_active = 1 ORDER BY title'
        );
        return rows;
    }

    // Get all quick buttons (admin)
    static async getAllButtons() {
        const [rows] = await db.execute(
            'SELECT id, title, description, type, price, is_active, created_at, updated_at FROM quick_buttons ORDER BY title'
        );
        return rows;
    }

    // Find a quick button by ID
    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM quick_buttons WHERE id = ?', [id]);
        return rows[0];
    }

    // Create a new quick button
    static async create(buttonData) {
        const { title, description, type, price } = buttonData;
        const [result] = await db.execute(
            `INSERT INTO quick_buttons (title, description, type, price)
             VALUES (?, ?, ?, ?)`,
            [title, description || null, type, price || 0]
        );
        return result.insertId;
    }

    // Update an existing quick button
    static async update(id, buttonData) {
        const { title, description, type, price, is_active } = buttonData;
        const [result] = await db.execute(
            `UPDATE quick_buttons 
             SET title = ?, description = ?, type = ?, price = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [title, description || null, type, price || 0, is_active, id]
        );
        return result.affectedRows;
    }

    // Soft delete (set is_active = 0)
    static async delete(id) {
        const [result] = await db.execute(
            'UPDATE quick_buttons SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    // Hard delete (optional)
    static async hardDelete(id) {
        const [result] = await db.execute('DELETE FROM quick_buttons WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = QuickButton;