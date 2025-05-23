const express=require ("express")
const {
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} =require ("../controllers/notificationController")
const { authenticateToken }=require("../middleware/auth")

const router = express.Router()

// Apply authentication middleware to all notification routes
router.use(authenticateToken)

// Get all notifications for the authenticated user
router.get("/", getAllNotifications)

// Get unread notifications count
router.get("/unread/count", getUnreadCount)

// Mark notification as read
router.patch("/:id/read", markAsRead)

// Mark all notifications as read
router.patch("/read/all", markAllAsRead)

// Delete a notification
router.delete("/:id", deleteNotification)

module.exports = router;
