const { query } = require("../config/db");

const NotificationModel = {
  // Find all notifications for a user
  findAllByUser: async (userId) => {
    return await query(
      `SELECT n.*, p.name as product_name 
       FROM notifications n
       LEFT JOIN products p ON n.product_id = p.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC`,
      [userId]
    );
  },

  // Find notification by ID for a specific user
  findByIdAndUser: async (id, userId) => {
    const notifications = await query(
      `SELECT * FROM notifications WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return notifications.length > 0 ? notifications[0] : null;
  },

  // Create a new notification
  create: async (notificationData) => {
    const { user_id, product_id, type, message } = notificationData;
    const result = await query(
      `INSERT INTO notifications (user_id, product_id, type, message) 
       VALUES (?, ?, ?, ?)`,
      [user_id, product_id, type, message]
    );
    return result.insertId;
  },

  // Check if notification exists for a product
  checkExistingForProduct: async (productId, type) => {
    const notifications = await query(
      `SELECT * FROM notifications 
       WHERE product_id = ? AND type = ? AND is_read = FALSE`,
      [productId, type]
    );
    return notifications.length > 0;
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const result = await query(`UPDATE notifications SET is_read = TRUE WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  },

  // Mark all notifications as read for a user
  markAllAsRead: async (userId) => {
    const result = await query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );
    return result.affectedRows > 0;
  },

  // Delete a notification
  delete: async (id) => {
    const result = await query(`DELETE FROM notifications WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  },

  // Get unread notifications count
  getUnreadCount: async (userId) => {
    const result = await query(
      `SELECT COUNT(*) as unread_count 
       FROM notifications 
       WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );
    return result[0].unread_count;
  },
};

module.exports = { NotificationModel };
