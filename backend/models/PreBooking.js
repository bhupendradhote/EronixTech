const db = require('../config/db');

class PreBooking {
    // 1. Create a new pre-booking request
    static async create(preBookingData) {
        const {
            product_id,
            variant_id,
            product_name,
            variant_name,
            name,
            email,
            phone,
            quantity,
            pincode,
            message,
        } = preBookingData;

        const [result] = await db.execute(
            `INSERT INTO pre_bookings 
            (product_id, variant_id, product_name, variant_name, name, email, phone, quantity, pincode, message) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                product_id,
                variant_id || null,
                product_name,
                variant_name || null,
                name,
                email,
                phone,
                quantity,
                pincode || null,
                message || null,
            ]
        );
        return result.insertId;
    }

    // 2. Find all pre-bookings (for admin)
    static async findAll() {
        const [rows] = await db.execute(
            'SELECT * FROM pre_bookings ORDER BY created_at DESC'
        );
        return rows;
    }

    // 3. Find a single pre-booking by ID
    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM pre_bookings WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // 4. Update the status of a pre-booking
    static async updateStatus(id, status) {
        const [result] = await db.execute(
            'UPDATE pre_bookings SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows;
    }

    // 5. Delete a pre-booking
    static async delete(id) {
        const [result] = await db.execute(
            'DELETE FROM pre_bookings WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }
}

module.exports = PreBooking;