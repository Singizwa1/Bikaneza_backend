const { query } = require("../config/db");

const ProductModel = {
  // Find all products for a user
  findAllByUser: async (userId) => {
    return await query(`SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
  },

  // Find product by ID for a specific user
  findByIdAndUser: async (id, userId) => {
    const products = await query(`SELECT * FROM products WHERE id = ? AND user_id = ?`, [id, userId]);
    return products.length > 0 ? products[0] : null;
  },

  // Find product by ID
  findById: async (id) => {
    const products = await query(`SELECT * FROM products WHERE id = ?`, [id]);
    return products.length > 0 ? products[0] : null;
  },

  // Create a new product
  create: async (productData) => {
    const { name, supplier_name, buying_price, current_quantity, expiration_date, user_id } = productData;
    const result = await query(
      `INSERT INTO products 
       (name, supplier_name, buying_price, current_quantity, initial_quantity, expiration_date, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, supplier_name, buying_price, current_quantity, current_quantity, expiration_date, user_id]
    );
    return result.insertId;
  },

  // Update a product
  update: async (id, updateData, userId) => {
    const updateFields = [];
    const queryParams = [];

    // Build dynamic update query
    Object.entries(updateData).forEach(([key, value]) => {
      if (
        value !== undefined &&
        ["name", "supplier_name", "buying_price", "current_quantity", "expiration_date"].includes(key)
      ) {
        updateFields.push(`${key} = ?`);
        queryParams.push(value);
      }
    });

    if (updateFields.length === 0) {
      return false;
    }

    // Add id and user_id to query params
    queryParams.push(id);
    queryParams.push(userId);

    const result = await query(
      `UPDATE products SET ${updateFields.join(", ")} WHERE id = ? AND user_id = ?`,
      queryParams
    );
    return result.affectedRows > 0;
  },

  // Delete a product
  delete: async (id, userId) => {
    const result = await query(`DELETE FROM products WHERE id = ? AND user_id = ?`, [id, userId]);
    return result.affectedRows > 0;
  },

  // Get low stock products
  findLowStock: async (userId) => {
    return await query(
      `SELECT * FROM products 
       WHERE user_id = ? AND current_quantity < (initial_quantity * 0.2)
       ORDER BY (current_quantity / initial_quantity) ASC`,
      [userId]
    );
  },

  // Get expiring products
  findExpiringSoon: async (userId) => {
    return await query(
      `SELECT * FROM products 
       WHERE user_id = ? AND expiration_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
       ORDER BY expiration_date ASC`,
      [userId]
    );
  },

  // Update product quantity
  updateQuantity: async (id, newQuantity) => {
    const result = await query(`UPDATE products SET current_quantity = ? WHERE id = ?`, [newQuantity, id]);
    return result.affectedRows > 0;
  },

  // Get all low stock products (for notification service)
  findAllLowStock: async () => {
    return await query(
      `SELECT * FROM products 
       WHERE current_quantity < (initial_quantity * 0.2)
       AND current_quantity > 0`
    );
  },

  // Get all expiring products (for notification service)
  findAllExpiringSoon: async () => {
    return await query(
      `SELECT * FROM products 
       WHERE expiration_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
    );
  },
};

module.exports = { ProductModel };
