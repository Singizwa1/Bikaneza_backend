const { query } = require('../config/db');

const SalesModel = {
  findAllByUser: async (userId) => {
    return await query(
      `SELECT s.*, p.name as product_name, p.buying_price 
       FROM sales s
       JOIN products p ON s.product_id = p.id
       WHERE s.user_id = ?
       ORDER BY s.sale_date DESC`,
      [userId],
    );
  },

  findByProductAndUser: async (productId, userId) => {
    return await query(
      `SELECT * FROM sales WHERE product_id = ? AND user_id = ? ORDER BY sale_date DESC`,
      [productId, userId],
    );
  },

  create: async (saleData) => {
    const { product_id, quantity_sold, selling_price, total_amount, profit_loss, user_id } = saleData;
    const result = await query(
      `INSERT INTO sales 
       (product_id, quantity_sold, selling_price, total_amount, profit_loss, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [product_id, quantity_sold, selling_price, total_amount, profit_loss, user_id],
    );
    return result.insertId;
  },

  findById: async (id) => {
    const sales = await query(
      `SELECT s.*, p.name as product_name 
       FROM sales s
       JOIN products p ON s.product_id = p.id
       WHERE s.id = ?`,
      [id],
    );
    return sales.length > 0 ? sales[0] : null;
  },

  getSummary: async (userId) => {
    const overallSummary = await query(
      `SELECT 
         COUNT(*) as total_sales,
         SUM(quantity_sold) as total_items_sold,
         SUM(total_amount) as total_revenue,
         SUM(profit_loss) as total_profit_loss
       FROM sales
       WHERE user_id = ?`,
      [userId],
    );

    const productSummary = await query(
      `SELECT 
         p.id,
         p.name,
         COUNT(s.id) as sale_count,
         SUM(s.quantity_sold) as total_quantity_sold,
         SUM(s.total_amount) as total_revenue,
         SUM(s.profit_loss) as total_profit_loss
       FROM products p
       LEFT JOIN sales s ON p.id = s.product_id AND s.user_id = ?
       WHERE p.user_id = ?
       GROUP BY p.id
       ORDER BY total_revenue DESC`,
      [userId, userId],
    );

    return {
      overall: overallSummary[0],
      products: productSummary,
    };
  },
};

module.exports = { SalesModel };
