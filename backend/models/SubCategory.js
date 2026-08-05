const db = require('../config/db');

class SubCategory {
    // 1. Create a new sub-category
    static async create(subCategoryData) {
        const {
            category_id, name, slug, description, icon_url, 
            is_active, display_order, meta_title, meta_description
        } = subCategoryData;

        const [result] = await db.execute(
            `INSERT INTO sub_categories 
            (category_id, name, slug, description, icon_url, is_active, display_order, meta_title, meta_description) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                category_id,
                name, 
                slug, 
                description || null, 
                icon_url || null, 
                is_active !== undefined ? is_active : 1, 
                display_order || 0, 
                meta_title || null, 
                meta_description || null
            ]
        );
        return result.insertId;
    }

    // 2. Find all sub-categories for a specific parent category
    static async findByCategoryId(category_id, activeOnly = false) {
        let query = 'SELECT * FROM sub_categories WHERE category_id = ?';
        if (activeOnly) {
            query += ' AND is_active = 1';
        }
        query += ' ORDER BY display_order ASC, created_at DESC';

        const [rows] = await db.execute(query, [category_id]);
        return rows;
    }

    // 3. Find a single sub-category by ID
    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM sub_categories WHERE id = ?', [id]);
        return rows[0];
    }

    // 4. Update an existing sub-category (Dynamic update)
    static async update(id, updateData) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) return 0;

        values.push(id);
        const query = `UPDATE sub_categories SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await db.execute(query, values);
        return result.affectedRows;
    }

    // 5. Delete a sub-category
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM sub_categories WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = SubCategory;