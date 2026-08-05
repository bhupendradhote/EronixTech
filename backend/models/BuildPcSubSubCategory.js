const db = require('../config/db');

class BuildPcSubSubCategory {
    static async create(data) {
        const {
            build_pc_subcategory_id, name, slug, description, icon_url, banner_url, 
            is_active, display_order, meta_title, meta_description
        } = data;

        const [result] = await db.execute(
            `INSERT INTO build_pc_sub_subcategories 
            (build_pc_subcategory_id, name, slug, description, icon_url, banner_url, is_active, display_order, meta_title, meta_description) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                build_pc_subcategory_id, name, slug, description || null, icon_url || null, banner_url || null, 
                is_active !== undefined ? is_active : 1, display_order || 0, 
                meta_title || null, meta_description || null
            ]
        );
        return result.insertId;
    }

    static async findBySubCategoryId(subCategoryId, activeOnly = false) {
        let query = 'SELECT * FROM build_pc_sub_subcategories WHERE build_pc_subcategory_id = ?';
        if (activeOnly) {
            query += ' AND is_active = 1';
        }
        query += ' ORDER BY display_order ASC, created_at DESC';
        
        const [rows] = await db.execute(query, [subCategoryId]);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM build_pc_sub_subcategories WHERE id = ?', [id]);
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
        const query = `UPDATE build_pc_sub_subcategories SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await db.execute(query, values);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM build_pc_sub_subcategories WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = BuildPcSubSubCategory;