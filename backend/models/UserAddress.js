const db = require('../config/db'); // Assuming your DB connection is here based on your example

class UserAddress {
    // 1. Create a new address
    static async create(addressData) {
        const {
            user_id, address_line_1, address_line_2, city, state,
            postal_code, country, address_type, is_default_shipping, is_default_billing
        } = addressData;

        const [result] = await db.execute(
            `INSERT INTO user_addresses 
            (user_id, address_line_1, address_line_2, city, state, postal_code, country, address_type, is_default_shipping, is_default_billing) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id, 
                address_line_1, 
                address_line_2 || null, 
                city, 
                state, 
                postal_code, 
                country || 'India', 
                address_type || 'Home', 
                is_default_shipping ? 1 : 0, 
                is_default_billing ? 1 : 0
            ]
        );
        return result.insertId;
    }

    // 2. Find all addresses for a specific user
    static async findByUserId(user_id) {
        const [rows] = await db.execute(
            'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY created_at DESC', 
            [user_id]
        );
        return rows;
    }

    // 3. Find a single address by its ID
    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM user_addresses WHERE id = ?', 
            [id]
        );
        return rows[0];
    }

    // 4. Update an existing address (Dynamic update to only change provided fields)
    static async update(id, updateData) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) return 0; // Nothing to update

        values.push(id); // Push ID for the WHERE clause
        const query = `UPDATE user_addresses SET ${fields.join(', ')} WHERE id = ?`;
        
        const [result] = await db.execute(query, values);
        return result.affectedRows;
    }

    // 5. Delete an address
    static async delete(id) {
        const [result] = await db.execute(
            'DELETE FROM user_addresses WHERE id = ?', 
            [id]
        );
        return result.affectedRows;
    }

    // 6. Helper: Reset default shipping/billing for a user
    static async resetDefaults(user_id, resetShipping, resetBilling) {
        if (resetShipping) {
            await db.execute('UPDATE user_addresses SET is_default_shipping = 0 WHERE user_id = ?', [user_id]);
        }
        if (resetBilling) {
            await db.execute('UPDATE user_addresses SET is_default_billing = 0 WHERE user_id = ?', [user_id]);
        }
    }
}

module.exports = UserAddress;