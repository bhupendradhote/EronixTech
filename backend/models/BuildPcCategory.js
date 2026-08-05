const db = require('../config/db');

class BuildPcCategory {
    static async create(categoryData) {
        const {
            name, slug, description, icon_url, banner_url, 
            is_active, display_order, meta_title, meta_description
        } = categoryData;

        const [result] = await db.execute(
            `INSERT INTO build_pc_categories 
            (name, slug, description, icon_url, banner_url, is_active, display_order, meta_title, meta_description) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, slug, description || null, icon_url || null, banner_url || null, 
                is_active !== undefined ? is_active : 1, display_order || 0, 
                meta_title || null, meta_description || null
            ]
        );
        return result.insertId;
    }

    static async findAll(activeOnly = false) {
        let query = 'SELECT * FROM build_pc_categories';
        if (activeOnly) {
            query += ' WHERE is_active = 1';
        }
        query += ' ORDER BY display_order ASC, created_at DESC';
        
        const [rows] = await db.execute(query);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM build_pc_categories WHERE id = ?', [id]);
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
        const query = `UPDATE build_pc_categories SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await db.execute(query, values);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM build_pc_categories WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = BuildPcCategory;