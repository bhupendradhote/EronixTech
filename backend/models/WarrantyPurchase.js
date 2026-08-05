// models/WarrantyPurchase.js
const db = require('../config/db');

class WarrantyPurchase {
  /**
   * Create a new warranty purchase record
   * @param {Object} data
   * @param {number} data.user_id
   * @param {number} data.product_id
   * @param {number|null} data.variant_id
   * @param {string} data.warranty_name
   * @param {number} data.warranty_price
   * @param {number} data.total_price
   * @param {string} data.status (default: 'active')
   * @returns {Promise<number>} insertId
   */
  static async create(data) {
    const {
      user_id,
      product_id,
      variant_id,
      warranty_name,
      warranty_price,
      total_price,
      status = 'active',
    } = data;

    const query = `
      INSERT INTO extended_warranty_purchases
      (user_id, product_id, variant_id, warranty_name, warranty_price, total_price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      user_id,
      product_id,
      variant_id || null,
      warranty_name,
      warranty_price,
      total_price,
      status,
    ]);
    return result.insertId;
  }

  // Optional: find by user, product, etc.
  static async findByUser(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM extended_warranty_purchases WHERE user_id = ? ORDER BY purchase_date DESC',
      [userId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM extended_warranty_purchases WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

module.exports = WarrantyPurchase;