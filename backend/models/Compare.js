const db = require('../config/db');

class Compare {
  // Get all compare items for a customer with product details
  static async getByCustomer(customerId) {
    const [rows] = await db.execute(
      `SELECT p.*, cp.id as compare_id, cp.created_at as compare_added_at
       FROM compare_products cp
       JOIN products p ON cp.product_id = p.id
       WHERE cp.customer_id = ?
       ORDER BY cp.created_at DESC`,
      [customerId]
    );
    return rows;
  }

  // Add a product to compare
  static async add(customerId, productId) {
    const [result] = await db.execute(
      'INSERT INTO compare_products (customer_id, product_id) VALUES (?, ?)',
      [customerId, productId]
    );
    return result;
  }

  // Remove a product from compare
  static async remove(customerId, productId) {
    const [result] = await db.execute(
      'DELETE FROM compare_products WHERE customer_id = ? AND product_id = ?',
      [customerId, productId]
    );
    return result.affectedRows;
  }

  // Clear all compare items for a customer
  static async clear(customerId) {
    const [result] = await db.execute(
      'DELETE FROM compare_products WHERE customer_id = ?',
      [customerId]
    );
    return result.affectedRows;
  }
}

module.exports = Compare;