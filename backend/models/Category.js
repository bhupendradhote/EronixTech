const db = require('../config/db');

class Category {
    // 1. Create a new category
    static async create(categoryData) {
        const {
            name, slug, description, icon_url, banner_url, 
            is_active, display_order, meta_title, meta_description
        } = categoryData;

        const [result] = await db.execute(
            `INSERT INTO categories 
            (name, slug, description, icon_url, banner_url, is_active, display_order, meta_title, meta_description) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, 
                slug, 
                description || null, 
                icon_url || null, 
                banner_url || null, 
                is_active !== undefined ? is_active : 1, 
                display_order || 0, 
                meta_title || null, 
                meta_description || null
            ]
        );
        return result.insertId;
    }

    // 2. Find all categories (Active only for frontend, or all for admin)
    static async findAll(activeOnly = false) {
        let query = 'SELECT * FROM categories';
        if (activeOnly) {
            query += ' WHERE is_active = 1';
        }
        query += ' ORDER BY display_order ASC, created_at DESC';
        
        const [rows] = await db.execute(query);
        return rows;
    }

    // 3. Find a single category by ID
    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0];
    }

    // 4. Update an existing category (Dynamic update)
    static async update(id, updateData) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) return 0;

        values.push(id);
        const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await db.execute(query, values);
        return result.affectedRows;
    }

    // 5. Delete a category (Will fail if sub-categories exist due to ON DELETE RESTRICT)
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Category;