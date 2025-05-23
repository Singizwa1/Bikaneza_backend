const express = require("express");
const { register, login, getProfile } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const {
  validateRegistration,
  validateLogin,
} = require("../middleware/validation");

const router = express.Router();

// Register a new user
router.post("/register", validateRegistration, register);

// Login user
router.post("/login", validateLogin, login);

// Get current user profile
router.get("/profile", authenticateToken, getProfile);

module.exports = router;
