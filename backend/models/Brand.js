const db = require('../config/db');

class Brand {
    // 1. Create a new brand
    static async create(brandData) {
        const { name, slug, description, logo_url, website_url, is_active } = brandData;

        const [result] = await db.execute(
            `INSERT INTO brands 
            (name, slug, description, logo_url, website_url, is_active) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name, 
                slug, 
                description || null, 
                logo_url || null, 
                website_url || null, 
                is_active !== undefined ? is_active : 1
            ]
        );
        return result.insertId;
    }

    // 2. Find all brands
    static async findAll(activeOnly = false) {
        let query = 'SELECT * FROM brands';
        if (activeOnly) {
            query += ' WHERE is_active = 1';
        }
        query += ' ORDER BY name ASC';
        
        const [rows] = await db.execute(query);
        return rows;
    }

    // 3. Find a single brand by ID
    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM brands WHERE id = ?', [id]);
        return rows[0];
    }

    // 4. Update an existing brand
    static async update(id, updateData) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) return 0; // Nothing to update

        values.push(id);
        const query = `UPDATE brands SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await db.execute(query, values);
        return result.affectedRows;
    }

    // 5. Delete a brand
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM brands WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Brand;