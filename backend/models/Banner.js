const db = require('../config/db');

class Banner {
    static async create(bannerData) {
        const { title, subtitle, image_url, link_url, banner_type, is_active, display_order } = bannerData;

        const [result] = await db.execute(
            `INSERT INTO banners 
            (title, subtitle, image_url, link_url, banner_type, is_active, display_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                title, 
                subtitle || null, 
                image_url || null, 
                link_url || null, 
                banner_type || 'Hero', 
                is_active !== undefined ? is_active : 1, 
                display_order || 0
            ]
        );
        return result.insertId;
    }

    static async findAll(activeOnly = false) {
        let query = 'SELECT * FROM banners';
        if (activeOnly) {
            query += ' WHERE is_active = 1';
        }
        query += ' ORDER BY display_order ASC, created_at DESC';
        
        const [rows] = await db.execute(query);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM banners WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, updateData) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) return 0;

        values.push(id);
        const query = `UPDATE banners SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await db.execute(query, values);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM banners WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Banner;