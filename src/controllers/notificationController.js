const { ProductModel } = require("../models/productModel");
const { NotificationModel } = require("../models/notificationModel");

// Controller functions
async function getAllNotifications(req, res) {
  try {
    const notifications = await NotificationModel.findAllByUser(req.user.id);
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
}

async function getUnreadCount(req, res) {
  try {
    const unreadCount = await NotificationModel.getUnreadCount(req.user.id);
    res.status(200).json({
      success: true,
      data: { unread_count: unreadCount },
    });
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread notifications count",
    });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;

    const notification = await NotificationModel.findByIdAndUser(id, req.user.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or you do not have permission to update it",
      });
    }

    await NotificationModel.markAsRead(id);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
}

async function markAllAsRead(req, res) {
  try {
    await NotificationModel.markAllAsRead(req.user.id);
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
}

async function deleteNotification(req, res) {
  try {
    const { id } = req.params;

    const notification = await NotificationModel.findByIdAndUser(id, req.user.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or you do not have permission to delete it",
      });
    }

    await NotificationModel.delete(id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
}

// Background/utility functions for stock and expiry notifications
async function checkLowStockProducts() {
  try {
    const lowStockProducts = await ProductModel.findAllLowStock();

    for (const product of lowStockProducts) {
      const notificationExists = await NotificationModel.checkExistingForProduct(product.id, "LOW_STOCK");

      if (!notificationExists) {
        const percentRemaining = Math.round((product.current_quantity / product.initial_quantity) * 100);

        await NotificationModel.create({
          user_id: product.user_id,
          product_id: product.id,
          type: "LOW_STOCK",
          message: `Low stock alert: ${product.name} is running low (${percentRemaining}% remaining). Only ${product.current_quantity} units left.`,
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error checking low stock products:", error);
    return false;
  }
}

async function checkLowStockForProduct(productId) {
  try {
    const product = await ProductModel.findById(productId);
    if (!product) return false;

    if (product.current_quantity < product.initial_quantity * 0.2 && product.current_quantity > 0) {
      const notificationExists = await NotificationModel.checkExistingForProduct(product.id, "LOW_STOCK");
      if (!notificationExists) {
        const percentRemaining = Math.round((product.current_quantity / product.initial_quantity) * 100);

        await NotificationModel.create({
          user_id: product.user_id,
          product_id: product.id,
          type: "LOW_STOCK",
          message: `Low stock alert: ${product.name} is running low (${percentRemaining}% remaining). Only ${product.current_quantity} units left.`,
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error checking product stock level:", error);
    return false;
  }
}

async function checkExpiringProducts() {
  try {
    const expiringProducts = await ProductModel.findAllExpiringSoon();

    for (const product of expiringProducts) {
      const notificationExists = await NotificationModel.checkExistingForProduct(product.id, "EXPIRING_SOON");

      if (!notificationExists) {
        const expirationDate = new Date(product.expiration_date);
        const today = new Date();
        const daysRemaining = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

        await NotificationModel.create({
          user_id: product.user_id,
          product_id: product.id,
          type: "EXPIRING_SOON",
          message: `Expiration alert: ${product.name} will expire in ${daysRemaining} days (${expirationDate.toISOString().split("T")[0]}). Current stock: ${product.current_quantity} units.`,
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error checking expiring products:", error);
    return false;
  }
}

module.exports = {
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  checkLowStockProducts,
  checkLowStockForProduct,
  checkExpiringProducts,
};
